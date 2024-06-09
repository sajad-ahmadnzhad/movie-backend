import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateMovieDto } from "./dto/create-movie.dto";
import { UpdateMovieDto } from "./dto/update-movie.dto";
import { User } from "../users/schemas/User.schema";
import { MoviesMessages } from "../../common/enum/moviesMessages.enum";
import { saveMovieFile } from "../../common/utils/upload-file.util";
import { InjectModel } from "@nestjs/mongoose";
import { Actor } from "../actors/schemas/Actor.schema";
import { Document, Model } from "mongoose";
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
import { PaginatedList } from "../../common/interfaces/public.interface";
import { Country } from "../countries/schemas/Country.schema";
import { CountriesMessages } from "../../common/enum/countriesMessages.enum";
import { IndustriesMessages } from "../../common/enum/industriesMessages.enum";
import { ActorsMessages } from "../../common/enum/actorsMessages.enum";
import { GenresMessages } from "src/common/enum/genresMessages.enum";

@Injectable()
export class MoviesService {
  constructor(
    @InjectModel(Movie.name) private readonly movieModel: Model<Movie>,
    @InjectModel(Actor.name) private readonly actorModel: Model<Actor>,
    @InjectModel(Genre.name) private readonly genreModel: Model<Genre>,
    @InjectModel(Industry.name) private readonly industryModel: Model<Industry>,
    @InjectModel(Country.name) private readonly countryModel: Model<Industry>,
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

  async findOne(id: string): Promise<Document> {
    const existingMovie = await this.movieModel.findById(id);

    if (!existingMovie) {
      throw new NotFoundException(MoviesMessages.NotFOundMovie);
    }

    return existingMovie;
  }

  search(movieQuery: string): Promise<Array<Document>> {
    if (!movieQuery?.trim()) {
      throw new BadRequestException(MoviesMessages.RequiredMovieQuery);
    }

    const movies = this.movieModel.find({
      title: { $regex: movieQuery },
    });

    return movies;
  }

  async findByCountry(id: string) {
    const existingCountry = await this.countryModel.findById(id);

    if (!existingCountry) {
      throw new NotFoundException(CountriesMessages.NotFoundCountry);
    }

    const movies = this.movieModel.find({
      countries: { $in: existingCountry._id },
    });
    return movies;
  }

  async findByIndustry(id: string) {
    const existingIndustry = await this.industryModel.findById(id);

    if (!existingIndustry) {
      throw new NotFoundException(IndustriesMessages.NotFoundIndustry);
    }

    const movies = this.movieModel.find({
      industries: { $in: id },
    });

    return movies;
  }

  async findByActor(id: string) {
    const existingActor = await this.actorModel.findById(id);

    if (!existingActor) {
      throw new NotFoundException(ActorsMessages.NotFoundActor);
    }

    const movies = this.movieModel.find({
      actors: { $in: id },
    });

    return movies;
  }

  async findByGenre(id: string) {
    const existingGenre = await this.genreModel.findById(id);

    if (!existingGenre) {
      throw new NotFoundException(GenresMessages.NotFoundGenre);
    }

    const movies = this.movieModel.find({
      genres: { $in: id },
    });

    return movies;
  }

  update(id: number, updateMovieDto: UpdateMovieDto) {
    return `This action updates a #${id} movie`;
  }

  remove(id: number) {
    return `This action removes a #${id} movie`;
  }
}
