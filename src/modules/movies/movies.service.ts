import { Inject, Injectable } from "@nestjs/common";
import { CreateMovieDto } from "./dto/create-movie.dto";
import { UpdateMovieDto } from "./dto/update-movie.dto";
import { User } from "../users/schemas/User.schema";
import { MoviesMessages } from "../../common/enum/moviesMessages.enum";
import { saveMovieFile } from "../../common/utils/upload-file.util";
import { InjectModel } from "@nestjs/mongoose";
import { Actor } from "../actors/schemas/Actor.schema";
import { Model } from "mongoose";
import {
  existingObjectIds,
  getMovieCountries,
} from "../../common/utils/functions.util";
import { Genre } from "../genres/schemas/Genre.schema";
import { Industry } from "../industries/schemas/Industry.schema";
import { Movie } from "./schemas/Movie.schema";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { RedisCache } from "cache-manager-redis-yet";
import {
  cachePagination,
  mongoosePagination,
} from "../../common/utils/pagination.util";
import { PaginatedList } from "src/common/interfaces/public.interface";

@Injectable()
export class MoviesService {
  constructor(
    @InjectModel(Movie.name) private readonly movieModel: Model<Movie>,
    @InjectModel(Actor.name) private readonly actorModel: Model<Actor>,
    @InjectModel(Genre.name) private readonly genreModel: Model<Genre>,
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

  async findAll(limit?: number, page?: number): Promise<PaginatedList<Movie>> {
    const moviesCache = await this.redisCache.get<Array<Movie>>("movies");

    if (moviesCache) {
      return cachePagination(limit, page, moviesCache);
    }

    const movies = await this.movieModel.find();
    await this.redisCache.set("movies", movies, 30_000);

    const query = this.movieModel.find();

    const mongoosePaginationResult = mongoosePagination(
      limit,
      page,
      query,
      this.movieModel
    );

    return mongoosePaginationResult;
  }

  findOne(id: number) {
    return `This action returns a #${id} movie`;
  }

  update(id: number, updateMovieDto: UpdateMovieDto) {
    return `This action updates a #${id} movie`;
  }

  remove(id: number) {
    return `This action removes a #${id} movie`;
  }
}
