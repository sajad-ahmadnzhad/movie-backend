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
import { User } from "../users/schemas/User.schema";
import { ApiTags } from "@nestjs/swagger";
import {
  CreateGenreDecorator,
  GetAllGenresDecorator,
  GetOneGenreDecorator,
} from "../../common/decorators/genres.decorator";
import { PaginatedList } from "../../common/interfaces/public.interface";
import { Genre } from "./schemas/Genre.schema";
import { IsValidObjectIdPipe } from "../../common/pipes/isValidObjectId.pipe";
import { Document } from "mongoose";

@Controller("genres")
@ApiTags("genres")
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

  @Get(":id")
  @GetOneGenreDecorator
  findOne(@Param("id", IsValidObjectIdPipe) id: string): Promise<Document> {
    return this.genresService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateGenreDto: UpdateGenreDto) {
    return this.genresService.update(+id, updateGenreDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.genresService.remove(+id);
  }
}
