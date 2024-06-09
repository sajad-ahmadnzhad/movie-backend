import {
  BadRequestException,
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
import { mongoosePagination } from "../../common/utils/pagination.util";
import { PaginatedList } from "../../common/interfaces/public.interface";
import { FilterMoviesDto } from "./dto/filter-movies.dot";

@Injectable()
export class MoviesService {
  constructor(
    @InjectModel(Movie.name) private readonly movieModel: Model<Movie>,
    @InjectModel(Actor.name) private readonly actorModel: Model<Actor>,
    @InjectModel(Genre.name) private readonly genreModel: Model<Genre>,
    @InjectModel(Industry.name) private readonly industryModel: Model<Industry>
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

  async findAll(
    filterMoviesDto: FilterMoviesDto
  ): Promise<PaginatedList<Movie>> {
    const { limit, page, genre, country, actor, industry } = filterMoviesDto;

    const filter: any = {};

    if (genre) filter.genres = { $in: genre };
    if (country) filter.countries = { $in: country };
    if (actor) filter.actors = { $in: actor };
    if (industry) filter.industries = { $in: industry };

    const query = this.movieModel.find(filter);
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

  update(id: number, updateMovieDto: UpdateMovieDto) {
    return `This action updates a #${id} movie`;
  }

  remove(id: number) {
    return `This action removes a #${id} movie`;
  }
}
