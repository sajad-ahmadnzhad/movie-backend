import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateMovieDto } from "../dto/movies/create-movie.dto";
import { UpdateMovieDto } from "../dto/movies/update-movie.dto";
import { User } from "../../users/schemas/User.schema";
import { MoviesMessages } from "../../../common/enum/moviesMessages.enum";
import {
  saveFile,
  saveMovieFile,
} from "../../../common/utils/upload-file.util";
import { InjectModel } from "@nestjs/mongoose";
import { Actor } from "../../actors/schemas/Actor.schema";
import { Document, Model } from "mongoose";
import {
  existingObjectIds,
  getMovieCountries,
} from "../../../common/utils/functions.util";
import { Genre } from "../../genres/schemas/Genre.schema";
import { Industry } from "../../industries/schemas/Industry.schema";
import { Movie } from "../schemas/Movie.schema";
import { mongoosePagination } from "../../../common/utils/pagination.util";
import {
  ICreatedBy,
  PaginatedList,
} from "../../../common/interfaces/public.interface";
import { FilterMoviesDto } from "../dto/movies/filter-movies.dot";
import { Like } from "../schemas/Like.schema";
import { Bookmark } from "../schemas/Bookmark.schema";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { RedisCache } from "cache-manager-redis-yet";

@Injectable()
export class MoviesService {
  constructor(
    @InjectModel(Movie.name) private readonly movieModel: Model<Movie>,
    @InjectModel(Actor.name) private readonly actorModel: Model<Actor>,
    @InjectModel(Genre.name) private readonly genreModel: Model<Genre>,
    @InjectModel(Like.name) private readonly likeModel: Model<Like>,
    @InjectModel(Bookmark.name) private readonly bookmarkModel: Model<Bookmark>,
    @InjectModel(Industry.name) private readonly industryModel: Model<Industry>,
    @Inject(CACHE_MANAGER) private readonly redisCache: RedisCache
  ) {}
  async create(
    createMovieDto: CreateMovieDto,
    user: User,
    files: { poster: Express.Multer.File[]; video: Express.Multer.File[] }
  ) {
    const { actors, genres, industries } = createMovieDto;

    await existingObjectIds(this.genreModel, genres, "Genre");
    await existingObjectIds(this.actorModel, actors, "Actor");
    await existingObjectIds(this.industryModel, industries, "Industry");

    const countries = await getMovieCountries(this.industryModel, industries);

    if (!files.poster || !files.video) {
      throw new BadRequestException(MoviesMessages.RequiredPosterAndVideo);
    }

    const paths = saveMovieFile(files, {
      videoPath: "movies",
      posterPath: "posters",
    });

    await this.movieModel.create({
      ...createMovieDto,
      video_URL: `/uploads/movies/${paths.videoName}`,
      poster_URL: `/uploads/posters/${paths.posterName}`,
      createdBy: user._id,
      countries,
    });

    return MoviesMessages.CreatedMovieSuccess;
  }

  async findAll(
    filterMoviesDto: FilterMoviesDto
  ): Promise<PaginatedList<Movie>> {
    const { limit, page, genre, country, actor, industry, release_year } =
      filterMoviesDto;

    const filter: any = {};

    if (genre) filter.genres = { $in: genre };
    if (country) filter.countries = { $in: country };
    if (actor) filter.actors = { $in: actor };
    if (industry) filter.industries = { $in: industry };
    if (release_year) filter.release_year = release_year;

    const query = this.movieModel.find(filter);
    let paginationResult = await mongoosePagination(
      limit,
      page,
      query,
      this.movieModel
    );

    const movieStatsPromises = paginationResult.data.map((movie: any) => {
      //* likes , visits , bookmarks in this method
      return this.calculateMovieStats(movie);
    });

    await Promise.all(movieStatsPromises);

    return paginationResult;
  }

  async findOne(id: string): Promise<Document> {
    const existingMovie = await this.checkExistMovieById(id);

    const existingMovieInCache = (await this.redisCache.get(
      `visitMovie:${id}`
    )) as number;

    await this.redisCache.set(`visitMovie:${id}`, existingMovieInCache + 1);

    //* likes , visits , bookmarks in this method
    return this.calculateMovieStats(existingMovie);
  }

  async search(movieQuery: string): Promise<Array<Document>> {
    if (!movieQuery?.trim()) {
      throw new BadRequestException(MoviesMessages.RequiredMovieQuery);
    }

    const movies = await this.movieModel
      .find({
        title: { $regex: movieQuery },
      })
      .lean();

    const movieStatsPromises = movies.map((movie: any) => {
      //* likes , visits , bookmarks in this method
      return this.calculateMovieStats(movie);
    });

    return Promise.all(movieStatsPromises);
  }

  async likeToggle(id: string, user: User): Promise<string> {
    await this.checkExistMovieById(id);

    const likedMovie = await this.likeModel.findOne({
      movieId: id,
      userId: user._id,
    });

    if (likedMovie) {
      await likedMovie.deleteOne();
      return MoviesMessages.UnlikedMovieSuccess;
    }

    await this.likeModel.create({ movieId: id, userId: user._id });
    return MoviesMessages.LikedMovieSuccess;
  }

  async bookmarkToggle(id: string, user: User): Promise<string> {
    await this.checkExistMovieById(id);

    const bookmarkedMovie = await this.bookmarkModel.findOne({
      movieId: id,
      userId: user._id,
    });

    if (bookmarkedMovie) {
      await bookmarkedMovie.deleteOne();
      return MoviesMessages.UnBookmarkMovieSuccess;
    }

    await this.bookmarkModel.create({ movieId: id, userId: user._id });
    return MoviesMessages.BookmarkMovieSuccess;
  }

  async update(
    id: string,
    updateMovieDto: UpdateMovieDto,
    user: User,
    files: { poster: Express.Multer.File[]; video: Express.Multer.File[] }
  ): Promise<string> {
    const existingMovie = await this.checkExistMovieById(id);

    const { actors, genres, industries } = updateMovieDto;
    let countries: null | string[] = null;

    if (genres) await existingObjectIds(this.genreModel, genres, "Genre");
    if (actors) await existingObjectIds(this.actorModel, actors, "Actor");
    if (industries) {
      await existingObjectIds(this.industryModel, industries, "Industry");
      countries = await getMovieCountries(this.industryModel, industries);
    }

    const filePaths: Partial<{ poster: string; video: string }> = {};
    if (files.poster) filePaths.poster = saveFile(files.poster[0], "posters");
    if (files.video) filePaths.video = saveFile(files.video[0], "movies");

    await existingMovie.updateOne({
      $set: {
        ...updateMovieDto,
        video_URL: filePaths.video && `/uploads/movies/${filePaths.video}`,
        poster_URL: filePaths.poster && `/uploads/posters/${filePaths.poster}`,
        createdBy: user._id,
        countries: countries ? countries : undefined,
      },
    });

    return MoviesMessages.UpdatedMovieSuccess;
  }

  async remove(id: string, user: User): Promise<string> {
    const existingMovie = await this.checkExistMovieById(id);

    if (String(user._id) !== String(existingMovie.createdBy._id)) {
      if (!user.isSuperAdmin)
        throw new ForbiddenException(MoviesMessages.CannotRemoveMovie);
    }

    await existingMovie.deleteOne();

    return MoviesMessages.RemovedMovieSuccess;
  }

  async checkExistMovieById(id: string): Promise<ICreatedBy<Movie>> {
    const existingMovie: ICreatedBy<Movie> | null = await this.movieModel
      .findById(id)
      .lean();

    if (!existingMovie) {
      throw new NotFoundException(MoviesMessages.NotFoundMovie);
    }

    return existingMovie;
  }

  private async calculateMovieStats(
    movie: Document<Movie>
  ): Promise<Document<Movie>> {
    const visitMovie = await this.redisCache.get<number>(
      `visitMovie:${movie._id}`
    );
    const likes = await this.likeModel.find({ movieId: `${movie._id}` }).lean();
    const countBookmarks = await this.bookmarkModel
      .find({ movieId: `${movie._id}` })
      .countDocuments();

    (movie as any).countVisits = visitMovie ? visitMovie : +!!visitMovie;

    (movie as any).countBookmarks = countBookmarks;

    (movie as any).likes = likes;

    return movie;
  }
}
