import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { GenresService } from "./genres.service";
import { CreateGenreDto } from "./dto/create-genre.dto";
import { UpdateGenreDto } from "./dto/update-genre.dto";
import { UserDecorator } from "../users/decorators/currentUser.decorator";
import { User } from "../users/schemas/User.schema";
import { ApiTags } from "@nestjs/swagger";
import { CreateGenreDecorator } from "src/common/decorators/genres.decorator";

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
  findAll() {
    return this.genresService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.genresService.findOne(+id);
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
