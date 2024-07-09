import {
  BadRequestException,
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
import {
  existingIds,
  existingObjectIds,
  getMovieCountries,
} from "../../../common/utils/functions.util";
import { typeORMPagination } from "../../../common/utils/pagination.util";
import { PaginatedList } from "../../../common/interfaces/public.interface";
import { FilterMoviesDto } from "../dto/movies/filter-movies.dot";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { RedisCache } from "cache-manager-redis-yet";
import { User } from "../../auth/entities/User.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Actor } from "../../actors/entities/actor.entity";
import {
  FindManyOptions,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from "typeorm";
import { Genre } from "../../genres/entities/genre.entity";
import { Industry } from "../../industries/entities/industry.entity";
import { Movie } from "../entities/movie.entity";
import { Country } from "../../countries/entities/country.entity";

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

    const fetchedData: {
      actors?: Actor[];
      genres?: Genre[];
      industries?: Industry[];
    } = {};

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
      ],
      order: { createdAt: "DESC" },
    };

    let paginatedMovies = await typeORMPagination(
      limit,
      page,
      this.movieRepository,
      options
    );

    return paginatedMovies;
  }

  // async findOne(id: string): Promise<Document> {
  //   const existingMovie = await this.checkExistMovieById(id);

  //   const existingMovieInCache = (await this.redisCache.get(
  //     `visitMovie:${id}`
  //   )) as number;

  //   await this.redisCache.set(`visitMovie:${id}`, existingMovieInCache + 1);

  //   //* likes , visits , bookmarks in this method
  //   return this.calculateMovieStats(existingMovie);
  // }

  // async search(
  //   movieQuery: string,
  //   limit?: number,
  //   page?: number
  // ): Promise<PaginatedList<Movie>> {
  //   if (!movieQuery?.trim()) {
  //     throw new BadRequestException(MoviesMessages.RequiredMovieQuery);
  //   }

  //   const query = this.movieModel
  //     .find({
  //       title: { $regex: movieQuery },
  //     })
  //     .lean();

  //   const paginatedMovies = await mongoosePagination(
  //     limit,
  //     page,
  //     query,
  //     this.movieModel
  //   );

  //   const moviesStatsPromises = paginatedMovies.data.map((movie: any) => {
  //     //* likes , visits , bookmarks in this method
  //     return this.calculateMovieStats(movie);
  //   });

  //   await Promise.all(moviesStatsPromises);

  //   return paginatedMovies;
  // }

  // async likeToggle(id: string, user: User): Promise<string> {
  //   await this.checkExistMovieById(id);

  //   const likedMovie = await this.likeModel.findOne({
  //     movieId: id,
  //     userId: user._id,
  //   });

  //   if (likedMovie) {
  //     await likedMovie.deleteOne();
  //     return MoviesMessages.UnlikedMovieSuccess;
  //   }

  //   await this.likeModel.create({ movieId: id, userId: user._id });
  //   return MoviesMessages.LikedMovieSuccess;
  // }

  // async bookmarkToggle(id: string, user: User): Promise<string> {
  //   await this.checkExistMovieById(id);

  //   const bookmarkedMovie = await this.bookmarkModel.findOne({
  //     movieId: id,
  //     userId: user._id,
  //   });

  //   if (bookmarkedMovie) {
  //     await bookmarkedMovie.deleteOne();
  //     return MoviesMessages.UnBookmarkMovieSuccess;
  //   }

  //   await this.bookmarkModel.create({ movieId: id, userId: user._id });
  //   return MoviesMessages.BookmarkMovieSuccess;
  // }

  // async update(
  //   id: string,
  //   updateMovieDto: UpdateMovieDto,
  //   user: User,
  //   files: { poster: Express.Multer.File[]; video: Express.Multer.File[] }
  // ): Promise<string> {
  //   const existingMovie = await this.checkExistMovieById(id);

  //   const { actors, genres, industries } = updateMovieDto;
  //   let countries: null | string[] = null;

  //   if (genres) await existingObjectIds(this.genreModel, genres, "Genre");
  //   if (actors) await existingObjectIds(this.actorModel, actors, "Actor");
  //   if (industries) {
  //     await existingObjectIds(this.industryModel, industries, "Industry");
  //     countries = await getMovieCountries(this.industryModel, industries);
  //   }

  //   const filePaths: Partial<{ poster: string; video: string }> = {};
  //   if (files.poster) filePaths.poster = saveFile(files.poster[0], "posters");
  //   if (files.video) filePaths.video = saveFile(files.video[0], "movies");

  //   await existingMovie.updateOne({
  //     $set: {
  //       ...updateMovieDto,
  //       video_URL: filePaths.video && `/uploads/movies/${filePaths.video}`,
  //       poster_URL: filePaths.poster && `/uploads/posters/${filePaths.poster}`,
  //       createdBy: user._id,
  //       countries: countries ? countries : undefined,
  //     },
  //   });

  //   return MoviesMessages.UpdatedMovieSuccess;
  // }

  // async remove(id: string, user: User): Promise<string> {
  //   const existingMovie = await this.checkExistMovieById(id);

  //   if (String(user._id) !== String(existingMovie.createdBy._id)) {
  //     if (!user.isSuperAdmin)
  //       throw new ForbiddenException(MoviesMessages.CannotRemoveMovie);
  //   }

  //   await existingMovie.deleteOne();

  //   return MoviesMessages.RemovedMovieSuccess;
  // }

  // async checkExistMovieById(id: string): Promise<ICreatedBy<Movie>> {
  //   const existingMovie: ICreatedBy<Movie> | null = await this.movieModel
  //     .findById(id)
  //     .lean();

  //   if (!existingMovie) {
  //     throw new NotFoundException(MoviesMessages.NotFoundMovie);
  //   }

  //   return existingMovie;
  // }

  // private async calculateMovieStats(
  //   movie: Document<Movie>
  // ): Promise<Document<Movie>> {
  //   const visitMovie = await this.redisCache.get<number>(
  //     `visitMovie:${movie._id}`
  //   );
  //   const likes = await this.likeModel.find({ movieId: `${movie._id}` }).lean();
  //   const countBookmarks = await this.bookmarkModel
  //     .find({ movieId: `${movie._id}` })
  //     .countDocuments();

  //   (movie as any).countVisits = visitMovie ? visitMovie : +!!visitMovie;

  //   (movie as any).countBookmarks = countBookmarks;

  //   (movie as any).likes = likes;

  //   return movie;
  // }
}
