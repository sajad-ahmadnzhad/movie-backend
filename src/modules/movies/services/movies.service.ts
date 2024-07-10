import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateMovieDto } from "../dto/movies/create-movie.dto";
import { UpdateMovieDto } from "../dto/movies/update-movie.dto";
import { MoviesMessages } from "../../../common/enum/moviesMessages.enum";
import {
  saveFile,
  saveMovieFile,
} from "../../../common/utils/upload-file.util";
import { existingIds, removeFile } from "../../../common/utils/functions.util";
import {
  cachePagination,
  typeORMPagination,
} from "../../../common/utils/pagination.util";
import { PaginatedList } from "../../../common/interfaces/public.interface";
import { FilterMoviesDto } from "../dto/movies/filter-movies.dot";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { RedisCache } from "cache-manager-redis-yet";
import { User } from "../../auth/entities/User.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Actor } from "../../actors/entities/actor.entity";
import { FindManyOptions, Like, Repository } from "typeorm";
import { Genre } from "../../genres/entities/genre.entity";
import { Industry } from "../../industries/entities/industry.entity";
import { Movie } from "../entities/movie.entity";
import { Like as LikeRepo } from "../entities/like.entity";
import { Country } from "../../countries/entities/country.entity";
import { Bookmark } from "../entities/Bookmark.entity";

@Injectable()
export class MoviesService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly redisCache: RedisCache,
    @InjectRepository(Actor)
    private readonly actorRepository: Repository<Actor>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
    @InjectRepository(Industry)
    private readonly industryRepository: Repository<Industry>,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(LikeRepo)
    private readonly likeRepository: Repository<LikeRepo>,
    @InjectRepository(Bookmark)
    private readonly bookmarkRepository: Repository<Bookmark>,
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>
  ) {}
  async create(
    createMovieDto: CreateMovieDto,
    user: User,
    files: { poster: Express.Multer.File[]; video: Express.Multer.File[] }
  ): Promise<string> {
    let { release_year, title, description, actors, genres, industries } =
      createMovieDto;

    const fetchedData: Partial<{
      actors: Actor[];
      genres: Genre[];
      industries: Industry[];
    }> = {};

    try {
      fetchedData.actors = await existingIds(actors, this.actorRepository);
      fetchedData.genres = await existingIds(genres, this.genreRepository);
      fetchedData.industries = await existingIds(
        industries,
        this.industryRepository
      );
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    if (!files.poster || !files.video) {
      throw new BadRequestException(MoviesMessages.RequiredPosterAndVideo);
    }

    const paths = saveMovieFile(files, {
      videoPath: "movies",
      posterPath: "posters",
    });

    const countries = await this.countryRepository
      .createQueryBuilder("country")
      .innerJoin("country.industries", "industry")
      .where("industry.id IN(:...ids)", { ids: industries })
      .getMany();

    const movie = this.movieRepository.create({
      video_URL: `/uploads/movies/${paths.videoName}`,
      poster_URL: `/uploads/posters/${paths.posterName}`,
      createdBy: user,
      countries,
      release_year,
      title,
      description,
      ...fetchedData,
    });

    await this.movieRepository.save(movie);

    return MoviesMessages.CreatedMovieSuccess;
  }

  async findAll(
    filterMoviesDto: FilterMoviesDto
  ): Promise<PaginatedList<Movie>> {
    const { limit, page, genre, country, actor, industry, release_year } =
      filterMoviesDto;

    const cacheKey = `movies_${limit}_${page}_${genre}_${country}_${actor}_${industry}_${release_year}`;

    const moviesCache = await this.redisCache.get<Movie[] | undefined>(
      cacheKey
    );

    if (moviesCache) {
      const paginatedCache = await cachePagination(limit, page, moviesCache);
      await this.calculateMovieVisits(paginatedCache.data);
      return paginatedCache;
    }

    const options: FindManyOptions<Movie> = {
      where: {
        genres: { id: genre },
        countries: { id: country },
        actors: { id: actor },
        industries: { id: industry },
        release_year,
      },
      relations: [
        "genres",
        "countries",
        "actors",
        "industries",
        "likes",
        "createdBy",
        "bookmarks",
      ],
      order: { createdAt: "DESC" },
    };

    const movies = await this.movieRepository.find(options);
    await this.redisCache.set(cacheKey, movies, 30_000);

    let paginatedMovies = await typeORMPagination(
      limit,
      page,
      this.movieRepository,
      options
    );

    await this.calculateMovieVisits(paginatedMovies.data);

    return paginatedMovies;
  }

  async findOne(id: number): Promise<Movie> {
    const existingMovie = await this.checkExistMovieById(id);

    const existingMovieInCache = (await this.redisCache.get(
      `visitMovie:${id}`
    )) as number;

    await this.redisCache.set(`visitMovie:${id}`, existingMovieInCache + 1);

    //* Calculate visits in this method
    return this.calculateMovieVisits(existingMovie);
  }

  async search(
    movieQuery: string,
    limit?: number,
    page?: number
  ): Promise<PaginatedList<Movie>> {
    if (!movieQuery?.trim()) {
      throw new BadRequestException(MoviesMessages.RequiredMovieQuery);
    }

    const cacheKey = `searchMovie_${movieQuery}_${limit}_${page}`;

    const moviesCache = await this.redisCache.get<Movie[] | undefined>(
      cacheKey
    );

    if (moviesCache) {
      const paginatedCache = await cachePagination(limit, page, moviesCache);
      await this.calculateMovieVisits(paginatedCache.data);
      return paginatedCache;
    }

    const options: FindManyOptions<Movie> = {
      where: [
        {
          title: Like(`%${movieQuery}%`),
        },
        {
          description: Like(`%${movieQuery}%`),
        },
      ],
      relations: [
        "genres",
        "countries",
        "actors",
        "industries",
        "likes",
        "createdBy",
        "bookmarks",
      ],
      order: { createdAt: "DESC" },
    };

    const paginatedMovies = await typeORMPagination(
      limit,
      page,
      this.movieRepository,
      options
    );

    const movies = await this.movieRepository.find(options);
    await this.redisCache.set(cacheKey, movies);

    await this.calculateMovieVisits(paginatedMovies.data);

    return paginatedMovies;
  }

  async likeToggle(id: number, user: User): Promise<string> {
    const movie = await this.checkExistMovieById(id);

    const likedMovie = await this.likeRepository
      .createQueryBuilder("like")
      .where("like.movie.id = :movieId", { movieId: movie.id })
      .andWhere("like.user.id = :userId", { userId: user.id })
      .getOne();

    if (likedMovie) {
      await this.likeRepository.remove(likedMovie);
      return MoviesMessages.UnlikedMovieSuccess;
    }

    const like = this.likeRepository.create({ movie, user });

    await this.likeRepository.save(like);

    return MoviesMessages.LikedMovieSuccess;
  }

  async bookmarkToggle(id: number, user: User): Promise<string> {
    const movie = await this.checkExistMovieById(id);

    const bookmarkedMovie = await this.bookmarkRepository
      .createQueryBuilder("bookmark")
      .where("bookmark.movie.id = :movieId", { movieId: movie.id })
      .andWhere("bookmark.user.id = :userId", { userId: user.id })
      .getOne();

    if (bookmarkedMovie) {
      await this.bookmarkRepository.remove(bookmarkedMovie);
      return MoviesMessages.UnBookmarkMovieSuccess;
    }

    const bookmark = this.bookmarkRepository.create({ movie, user });

    await this.bookmarkRepository.save(bookmark);

    return MoviesMessages.BookmarkMovieSuccess;
  }

  async update(
    id: number,
    updateMovieDto: UpdateMovieDto,
    user: User,
    files: { poster: Express.Multer.File[]; video: Express.Multer.File[] }
  ): Promise<string> {
    const movie = await this.checkExistMovieById(id);

    let { release_year, title, description, actors, genres, industries } =
      updateMovieDto;

    if (!movie.createdBy && !user.isSuperAdmin) {
      throw new ConflictException(MoviesMessages.OnlySuperAdminCanUpdateMovie);
    }

    if (movie.createdBy)
      if (movie.createdBy.id !== user.id && !user.isSuperAdmin) {
        throw new ForbiddenException(MoviesMessages.CannotUpdateMovie);
      }

    try {
      if (genres) {
        const fetchedGenres = await existingIds(genres, this.genreRepository);
        await this.movieRepository
          .createQueryBuilder()
          .relation(Movie, "genres")
          .of(movie)
          .addAndRemove(fetchedGenres, movie.genres);
      }

      if (actors) {
        const fetchedActors = await existingIds(actors, this.actorRepository);
        await this.movieRepository
          .createQueryBuilder()
          .relation(Movie, "actors")
          .of(movie)
          .addAndRemove(fetchedActors, movie.actors);
      }

      if (industries) {
        const fetchedIndustries = await existingIds(
          industries,
          this.industryRepository
        );
        await this.movieRepository
          .createQueryBuilder()
          .relation(Movie, "industries")
          .of(movie)
          .addAndRemove(fetchedIndustries, movie.industries);

        const countries = await this.countryRepository
          .createQueryBuilder("country")
          .innerJoin("country.industries", "industry")
          .where("industry.id IN(:...ids)", { ids: industries })
          .getMany();

        await this.movieRepository
          .createQueryBuilder()
          .relation(Movie, "countries")
          .of(movie)
          .addAndRemove(countries, movie.countries);
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }

    const filePaths: Partial<{ poster: string; video: string }> = {};
    if (files.poster) filePaths.poster = saveFile(files.poster[0], "posters");
    if (files.video) filePaths.video = saveFile(files.video[0], "movies");

    await this.movieRepository.update(
      { id },
      {
        title,
        description,
        release_year,
        video_URL: filePaths.video && `/uploads/movies/${filePaths.video}`,
        poster_URL: filePaths.poster && `/uploads/posters/${filePaths.poster}`,
      }
    );

    if (files.poster) removeFile(movie.poster_URL);
    if (files.video) removeFile(movie.video_URL);

    return MoviesMessages.UpdatedMovieSuccess;
  }

  async remove(id: number, user: User): Promise<string> {
    const movie = await this.checkExistMovieById(id);

    if (!movie.createdBy && !user.isSuperAdmin) {
      throw new ConflictException(MoviesMessages.OnlySuperAdminCanRemoveMovie);
    }

    if (movie.createdBy)
      if (movie.createdBy.id !== user.id && !user.isSuperAdmin) {
        throw new ForbiddenException(MoviesMessages.CannotRemoveMovie);
      }

    await this.movieRepository.remove(movie);

    removeFile(movie.video_URL);
    removeFile(movie.poster_URL);

    return MoviesMessages.RemovedMovieSuccess;
  }

  async checkExistMovieById(id: number): Promise<Movie> {
    const existingMovie = await this.movieRepository.findOne({
      where: { id },
      relations: [
        "genres",
        "countries",
        "actors",
        "industries",
        "likes",
        "createdBy",
        "bookmarks",
      ],
    });
    if (!existingMovie) {
      throw new NotFoundException(MoviesMessages.NotFoundMovie);
    }

    return existingMovie;
  }

  private async calculateMovieVisits(movies: Movie | Movie[]): Promise<any> {
    if (Array.isArray(movies)) {
      return Promise.all(movies.map((m) => this.calculateMovieVisits(m)));
    }

    const visitMovie = await this.redisCache.get<number>(
      `visitMovie:${movies.id}`
    );

    (movies as any).countVisits = visitMovie ? visitMovie : +!!visitMovie;

    return movies;
  }
}
