import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateMovieDto } from "../dto/movies/create-movie.dto";
import { UpdateMovieDto } from "../dto/movies/update-movie.dto";
import { MoviesMessages } from "../../../common/enums/moviesMessages.enum";
import { pagination } from "../../../common/utils/pagination.util";
import { PaginatedList } from "../../../common/interfaces/public.interface";
import { FilterMoviesDto } from "../dto/movies/filter-movies.dot";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { RedisCache } from "cache-manager-redis-yet";
import { User } from "../../auth/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, Like, Repository } from "typeorm";
import { Movie } from "../entities/movie.entity";
import { Like as LikeEntity } from "../entities/like.entity";
import { Country } from "../../countries/entities/country.entity";
import { Bookmark } from "../entities/bookmark.entity";
import { Roles } from "../../../common/enums/roles.enum";
import { S3Service } from "../../../modules/s3/s3.service";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class MoviesService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly redisCache: RedisCache,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(LikeEntity)
    private readonly likeRepository: Repository<LikeEntity>,
    @InjectRepository(Bookmark)
    private readonly bookmarkRepository: Repository<Bookmark>,
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
    @Inject(forwardRef(() => S3Service)) private readonly s3Service: S3Service
  ) {}
  async create(
    createMovieDto: CreateMovieDto,
    user: User,
    files: { poster: Express.Multer.File[]; video: Express.Multer.File[] }
  ): Promise<string> {
    let { release_year, title, description, actors, genres, industries } =
      createMovieDto;

    if (!files.poster || !files.video) {
      throw new BadRequestException(MoviesMessages.RequiredPosterAndVideo);
    }

    const videoPath = await this.s3Service.multipartUploadFile(
      files.video[0],
      "movies"
    );
    const posterPath = await this.s3Service.uploadFile(
      files.poster[0],
      "posters"
    );

    const countries = await this.countryRepository
      .createQueryBuilder("country")
      .innerJoin("country.industries", "industry")
      .where("industry.id IN(:...ids)", { ids: industries.map((i) => i.id) })
      .getMany();

    const movie = this.movieRepository.create({
      video_URL: videoPath.Location,
      poster_URL: posterPath.Location,
      createdBy: user,
      countries,
      release_year,
      title,
      description,
      genres,
      actors,
      industries,
    });

    await this.movieRepository.save(movie);

    return MoviesMessages.CreatedMovieSuccess;
  }

  async findAll(
    filterMoviesDto: FilterMoviesDto
  ): Promise<PaginatedList<Movie>> {
    const { limit, page, genre, country, actor, industry, release_year } =
      filterMoviesDto;

    const cacheKey = `movies_${genre}_${country}_${actor}_${industry}_${release_year}`;

    const moviesCache = await this.redisCache.get<Movie[] | undefined>(
      cacheKey
    );

    if (moviesCache) {
      return pagination(limit, page, moviesCache);
    }

    const options: FindManyOptions<Movie> = {
      where: {
        industries: { id: industry },
        countries: { id: country },
        actors: { id: actor },
        genres: { id: genre },
        release_year,
      },
      relations: [
        "genres",
        "likes",
        "bookmarks",
        "countries",
        "actors",
        "industries",
        "createdBy",
      ],
      select: {
        createdBy: {
          id: true,
          name: true,
          username: true,
          avatarURL: true,
        },
      },
      order: { createdAt: "DESC" },
    };

    const movies = await this.movieRepository.find(options);

    await this.redisCache.set(cacheKey, movies, 30_000);

    return pagination(limit, page, movies);
  }

  async findOne(id: number): Promise<Movie> {
    const existingMovie = await this.checkExistMovieById(id);

    const existingMovieInCache = (await this.redisCache.get(
      `visitMovie:${id}`
    )) as number;

    await this.redisCache.set(`visitMovie:${id}`, existingMovieInCache + 1);

    return existingMovie;
  }

  async search(
    movieQuery: string,
    limit?: number,
    page?: number
  ): Promise<PaginatedList<Movie>> {
    if (!movieQuery?.trim()) {
      throw new BadRequestException(MoviesMessages.RequiredMovieQuery);
    }

    const cacheKey = `searchMovie_${movieQuery}`;

    const moviesCache = await this.redisCache.get<Movie[] | undefined>(
      cacheKey
    );

    if (moviesCache) {
      return pagination(limit, page, moviesCache);
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
        "likes",
        "bookmarks",
        "countries",
        "actors",
        "industries",
        "createdBy",
      ],
      select: {
        createdBy: {
          id: true,
          name: true,
          username: true,
          avatarURL: true,
        },
      },
      order: { createdAt: "DESC" },
    };

    const movies = await this.movieRepository.find(options);

    await this.redisCache.set(cacheKey, movies, 30_000);

    return pagination(limit, page, movies);
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

  async getBookmarkHistory(
    user: User,
    limit?: number,
    page?: number
  ): Promise<PaginatedList<Bookmark>> {
    const bookmarksCache = await this.redisCache.get<Bookmark[] | undefined>(
      "bookmark-history"
    );

    if (bookmarksCache) {
      return pagination(limit, page, bookmarksCache);
    }

    const options: FindManyOptions<Bookmark> = {
      where: {
        movie: { createdBy: { id: user.id } },
      },
      relations: ["user", "movie"],
      order: { createdAt: "DESC" },
    };

    const bookmarks = await this.bookmarkRepository.find(options);

    await this.redisCache.set("bookmark-history", bookmarks, 30_000);

    return pagination(limit, page, bookmarks);
  }

  async getLikeHistory(
    user: User,
    limit?: number,
    page?: number
  ): Promise<PaginatedList<LikeEntity>> {
    const likesCache = await this.redisCache.get<LikeEntity[] | undefined>(
      "bookmark-history"
    );

    if (likesCache) {
      return pagination(limit, page, likesCache);
    }

    const options: FindManyOptions<LikeEntity> = {
      where: {
        movie: { createdBy: { id: user.id } },
      },
      relations: ["user", "movie"],
      order: { createdAt: "DESC" },
    };

    const likes = await this.likeRepository.find(options);

    await this.redisCache.set("likes-history", likes, 30_000);

    return pagination(limit, page, likes);
  }

  async update(
    id: number,
    updateMovieDto: UpdateMovieDto,
    user: User,
    files: { poster: Express.Multer.File[]; video: Express.Multer.File[] }
  ): Promise<string> {
    const movie = await this.checkExistMovieById(id);

    const { genres, industries, actors } = updateMovieDto;

    if (!movie.createdBy && user.role !== Roles.SUPER_ADMIN) {
      throw new ConflictException(MoviesMessages.OnlySuperAdminCanUpdateMovie);
    }

    if (movie.createdBy)
      if (movie.createdBy.id !== user.id && user.role !== Roles.SUPER_ADMIN) {
        throw new ForbiddenException(MoviesMessages.CannotUpdateMovie);
      }

    const filePaths: Partial<{ poster: string; video: string }> = {};

    if (files.video) {
      const video = await this.s3Service.uploadFile(files.video[0], "movies");
      filePaths.video = video.Location;
    }

    if (files.poster) {
      const poster = await this.s3Service.uploadFile(
        files.poster[0],
        "posters"
      );
      filePaths.poster = poster.Location;
    }

    const industryIds = industries?.map((i) => i.id);
    const countries = await this.countryRepository
      .createQueryBuilder("country")
      .innerJoin("country.industries", "industry")
      .where("industry.id IN(:...ids)", {
        ids: industryIds?.length ? industryIds : [null],
      })
      .getMany();

    Object.assign(movie, {
      ...updateMovieDto,
      video_URL: filePaths.video,
      poster_URL: filePaths.poster,
      industries: industries?.length ? industries : undefined,
      genres: genres?.length ? genres : undefined,
      actors: actors?.length ? actors : undefined,
      countries: countries.length ? countries : undefined,
    });

    await this.movieRepository.save(movie);
    if (files.poster) await this.s3Service.deleteFile(movie.poster_URL);
    if (files.video) await this.s3Service.deleteFile(movie.video_URL);

    return MoviesMessages.UpdatedMovieSuccess;
  }

  async remove(id: number, user: User): Promise<string> {
    const movie = await this.checkExistMovieById(id);

    if (!movie.createdBy && user.role !== Roles.SUPER_ADMIN) {
      throw new ConflictException(MoviesMessages.OnlySuperAdminCanRemoveMovie);
    }

    if (movie.createdBy)
      if (movie.createdBy.id !== user.id && user.role !== Roles.SUPER_ADMIN) {
        throw new ForbiddenException(MoviesMessages.CannotRemoveMovie);
      }

    await this.movieRepository.remove(movie);

    await this.s3Service.deleteFile(movie.video_URL);
    await this.s3Service.deleteFile(movie.poster_URL);

    return MoviesMessages.RemovedMovieSuccess;
  }

  async checkExistMovieById(id: number): Promise<Movie> {
    const existingMovie = await this.movieRepository.findOne({
      where: { id },
      relations: [
        "genres",
        "likes",
        "bookmarks",
        "countries",
        "actors",
        "industries",
        "createdBy",
      ],
      select: {
        createdBy: {
          id: true,
          name: true,
          username: true,
          avatarURL: true,
        },
      },
    });
    if (!existingMovie) {
      throw new NotFoundException(MoviesMessages.NotFoundMovie);
    }

    return existingMovie;
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async calculateMovieVisits(): Promise<void> {
    const movies = await this.movieRepository.find();

    const moviesVisits = movies.flatMap(async (movie) => {
      const visitMovie = await this.redisCache.get<number>(
        `visitMovie:${movie.id}`
      );

      if (visitMovie) {
        movie.visitsCount += visitMovie;
        return [
          this.redisCache.del(`visitMovie:${movie.id}`),
          this.movieRepository.save(movie),
        ];
      }
    });

    await Promise.all(moviesVisits);
  }
}
