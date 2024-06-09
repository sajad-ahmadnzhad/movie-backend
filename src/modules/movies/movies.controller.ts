import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFiles,
  ParseIntPipe,
  Query,
} from "@nestjs/common";
import { MoviesService } from "./movies.service";
import { CreateMovieDto } from "./dto/create-movie.dto";
import { UpdateMovieDto } from "./dto/update-movie.dto";
import { Throttle } from "@nestjs/throttler";
import {
  CreateMovieDecorator,
  GetAllMoviesDecorator,
  GetMoviesByActor,
  GetMoviesByCountry,
  GetMoviesByIndustry,
  GetOneMovieDecorator,
  SearchMoviesDecorator,
} from "../../common/decorators/movie.decorator";
import { ApiTags } from "@nestjs/swagger";
import { UserDecorator } from "../users/decorators/currentUser.decorator";
import { User } from "../users/schemas/User.schema";
import { PaginatedList } from "../../common/interfaces/public.interface";
import { Movie } from "./schemas/Movie.schema";
import { IsValidObjectIdPipe } from "../../common/pipes/isValidObjectId.pipe";
import { Document } from "mongoose";

@Controller("movies")
@ApiTags("movies")
@Throttle({ default: { ttl: 60_000, limit: 30 } })
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
  @CreateMovieDecorator
  create(
    @Body() createMovieDto: CreateMovieDto,
    @UploadedFiles()
    files: { poster: Express.Multer.File[]; video: Express.Multer.File[] },
    @UserDecorator() user: User
  ) {
    return this.moviesService.create(createMovieDto, user, files);
  }

  @Get()
  @GetAllMoviesDecorator
  findAll(
    @Query("page", new ParseIntPipe({ optional: true })) page?: number,
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number
  ): Promise<PaginatedList<Movie>> {
    return this.moviesService.findAll(limit, page);
  }

  @Get("search")
  @SearchMoviesDecorator
  search(@Query("movie") movie: string): Promise<Array<Document>> {
    return this.moviesService.search(movie);
  }

  @GetOneMovieDecorator
  @Get(":id")
  findOne(@Param("id", IsValidObjectIdPipe) id: string): Promise<Document> {
    return this.moviesService.findOne(id);
  }

  @Get("by-country/:id")
  @GetMoviesByCountry
  getMoviesByCountry(
    @Param("id", IsValidObjectIdPipe) id: string
  ): Promise<Document[]> {
    return this.moviesService.findByCountry(id);
  }

  @Get("by-industry/:id")
  @GetMoviesByIndustry
  getMoviesByIndustry(
    @Param("id", IsValidObjectIdPipe) id: string
  ): Promise<Document[]> {
    return this.moviesService.findByIndustry(id);
  }

  @Get("by-actor/:id")
  @GetMoviesByActor
  getMoviesByActor(
    @Param("id", IsValidObjectIdPipe) id: string
  ): Promise<Document[]> {
    return this.moviesService.findByActor(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateMovieDto: UpdateMovieDto) {
    return this.moviesService.update(+id, updateMovieDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.moviesService.remove(+id);
  }
}
