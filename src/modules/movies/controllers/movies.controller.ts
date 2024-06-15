import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFiles,
  Query,
} from "@nestjs/common";
import { MoviesService } from "../services/movies.service";
import { CreateMovieDto } from "../dto/movies/create-movie.dto";
import { UpdateMovieDto } from "../dto/movies/update-movie.dto";
import { Throttle } from "@nestjs/throttler";
import {
  CreateMovieDecorator,
  GetAllMoviesDecorator,
  GetOneMovieDecorator,
  SearchMoviesDecorator,
  RemoveMovieDecorator,
  UpdateMovieDecorator,
  LikeMovieDecorator,
  BookmarkMovieDecorator,
} from "../../../common/decorators/movie.decorator";
import { ApiTags } from "@nestjs/swagger";
import { UserDecorator } from "../../users/decorators/currentUser.decorator";
import { User } from "../../users/schemas/User.schema";
import { PaginatedList } from "../../../common/interfaces/public.interface";
import { Movie } from "../schemas/Movie.schema";
import { IsValidObjectIdPipe } from "../../../common/pipes/isValidObjectId.pipe";
import { Document } from "mongoose";
import { FilterMoviesDto } from "../dto/movies/filter-movies.dot";

@Controller("movies")
@ApiTags("movies")
@Throttle({ default: { ttl: 60_000, limit: 30 } })
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
  @CreateMovieDecorator
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  async create(
    @Body() createMovieDto: CreateMovieDto,
    @UploadedFiles()
    files: { poster: Express.Multer.File[]; video: Express.Multer.File[] },
    @UserDecorator() user: User
  ) {
    const success = await this.moviesService.create(
      createMovieDto,
      user,
      files
    );

    return { message: success };
  }

  @Get()
  @GetAllMoviesDecorator
  findAll(
    @Query() filterMoviesDto: FilterMoviesDto
  ): Promise<PaginatedList<Movie>> {
    return this.moviesService.findAll(filterMoviesDto);
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

  @Post("like/:id")
  @LikeMovieDecorator
  async likeToggle(
    @Param("id", IsValidObjectIdPipe) id: string,
    @UserDecorator() user: User
  ): Promise<{ message: string }> {
    const success = await this.moviesService.likeToggle(id, user);

    return { message: success };
  }

  @Post("bookmark/:id")
  @BookmarkMovieDecorator
  async bookmarkToggle(
    @Param("id", IsValidObjectIdPipe) id: string,
    @UserDecorator() user: User
  ): Promise<{ message: string }> {
    const success = await this.moviesService.bookmarkToggle(id, user);

    return { message: success };
  }

  @Patch(":id")
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @UpdateMovieDecorator
  async update(
    @Param("id", IsValidObjectIdPipe) id: string,
    @Body() updateMovieDto: UpdateMovieDto,
    @UserDecorator() user: User,
    @UploadedFiles()
    files: { poster: Express.Multer.File[]; video: Express.Multer.File[] }
  ): Promise<{ message: string }> {
    const success = await this.moviesService.update(
      id,
      updateMovieDto,
      user,
      files
    );
    return { message: success };
  }

  @Delete(":id")
  @RemoveMovieDecorator
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  async remove(
    @Param("id", IsValidObjectIdPipe) id: string,
    @UserDecorator() user: User
  ): Promise<{ message: string }> {
    const success = await this.moviesService.remove(id, user);

    return { message: success };
  }
}
