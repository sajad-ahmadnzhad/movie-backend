import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from "@nestjs/common";
import { GenresService } from "./genres.service";
import { CreateGenreDto } from "./dto/create-genre.dto";
import { UpdateGenreDto } from "./dto/update-genre.dto";
import { UserDecorator } from "../users/decorators/currentUser.decorator";
import { ApiTags } from "@nestjs/swagger";
import {
  CreateGenreDecorator,
  GetAllGenresDecorator,
  GetOneGenreDecorator,
  RemoveGenreDecorator,
  SearchGenresDecorator,
  UpdateGenreDecorator,
} from "../../common/decorators/genres.decorator";
import { PaginatedList } from "../../common/interfaces/public.interface";
import { Throttle } from "@nestjs/throttler";
import { User } from "../auth/entities/user.entity";
import { Genre } from "./entities/genre.entity";

@Controller({
  path: "genres",
  version: "1.0.0",
})
@ApiTags("genres")
@Throttle({ default: { ttl: 60_000, limit: 30 } })
export class GenresController {
  constructor(private readonly genresService: GenresService) {}

  @Post()
  @CreateGenreDecorator
  async create(
    @Body() createGenreDto: CreateGenreDto,
    @UserDecorator() user: User
  ): Promise<{ message: string }> {
    const success = await this.genresService.create(createGenreDto, user);
    return { message: success };
  }

  @Get()
  @GetAllGenresDecorator
  findAll(
    @Query("page", new ParseIntPipe({ optional: true })) page?: number,
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number
  ): Promise<PaginatedList<Genre>> {
    return this.genresService.findAll(limit, page);
  }

  @Get("search")
  @SearchGenresDecorator
  search(
    @Query("genre") genre: string,
    @Query("page", new ParseIntPipe({ optional: true })) page?: number,
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number
  ): Promise<PaginatedList<Genre>> {
    return this.genresService.search(genre , limit , page);
  }

  @Get(":id")
  @GetOneGenreDecorator
  findOne(@Param("id", ParseIntPipe) id: number): Promise<Genre> {
    return this.genresService.findOne(id);
  }

  @Patch(":id")
  @UpdateGenreDecorator
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateCountryDto: UpdateGenreDto,
    @UserDecorator() user: User
  ): Promise<{ message: string }> {
    const success = await this.genresService.update(id, updateCountryDto, user);

    return { message: success };
  }

  @Delete(":id")
  @RemoveGenreDecorator
  async remove(
    @Param("id", ParseIntPipe) id: number,
    @UserDecorator() user: User
  ): Promise<{ message: string }> {
    const success = await this.genresService.remove(id, user);

    return { message: success };
  }
}
