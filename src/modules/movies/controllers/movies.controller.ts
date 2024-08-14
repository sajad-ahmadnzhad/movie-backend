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
  ParseIntPipe,
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
  BookmarkMovieDecorator,
  GetBookmarkHistoryDecorator,
  GetLikeHistoryDecorator,
} from "../../../common/decorators/movie.decorator";
import { ApiTags } from "@nestjs/swagger";
import { UserDecorator } from "../../users/decorators/currentUser.decorator";
import { PaginatedList } from "../../../common/interfaces/public.interface";
import { FilterMoviesDto } from "../dto/movies/filter-movies.dot";
import { User } from "../../auth/entities/user.entity";
import { Movie } from "../entities/movie.entity";

@Controller({
  path: "movies",
  version: "1",
})
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
  search(
    @Query("movie") movie: string,
    @Query("page", new ParseIntPipe({ optional: true })) page?: number,
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number
  ): Promise<PaginatedList<Movie>> {
    return this.moviesService.search(movie, limit, page);
  }

  @Post("bookmark/:id")
  @BookmarkMovieDecorator
  async bookmarkToggle(
    @Param("id", ParseIntPipe) id: number,
    @UserDecorator() user: User
  ): Promise<{ message: string }> {
    const success = await this.moviesService.bookmarkToggle(id, user);

    return { message: success };
  }

  @Get("bookmark-history")
  @GetBookmarkHistoryDecorator
  getBookmarkHistory(
    @UserDecorator() user: User,
    @Query("page", new ParseIntPipe({ optional: true })) page?: number,
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number
  ) {
    return this.moviesService.getBookmarkHistory(user, limit, page);
  }

  @Get("like-history")
  @GetLikeHistoryDecorator
  getLikeHistory(
    @UserDecorator() user: User,
    @Query("page", new ParseIntPipe({ optional: true })) page?: number,
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number
  ) {
    return this.moviesService.getLikeHistory(user, limit, page);
  }

  @GetOneMovieDecorator
  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.moviesService.findOne(id);
  }

  @Patch(":id")
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @UpdateMovieDecorator
  async update(
    @Param("id", ParseIntPipe) id: number,
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
    @Param("id", ParseIntPipe) id: number,
    @UserDecorator() user: User
  ): Promise<{ message: string }> {
    const success = await this.moviesService.remove(id, user);

    return { message: success };
  }
}
