import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UploadedFiles,
} from "@nestjs/common";
import { MoviesService } from "./movies.service";
import { CreateMovieDto } from "./dto/create-movie.dto";
import { UpdateMovieDto } from "./dto/update-movie.dto";
import { Throttle } from "@nestjs/throttler";
import { CreateMovieDecorator } from "../../common/decorators/movie.decorator";
import { ApiTags } from "@nestjs/swagger";
import { UserDecorator } from "../users/decorators/currentUser.decorator";
import { User } from "../users/schemas/User.schema";

@Controller("movies")
@ApiTags('movies')
@Throttle({ default: { ttl: 60_000, limit: 30 } })
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
  @CreateMovieDecorator
  create(
    @Body() createMovieDto: CreateMovieDto,
    @UploadedFiles() files: { poster: Express.Multer.File[], video: Express.Multer.File[] },
    @UserDecorator() user: User,
  ) {
    return this.moviesService.create(createMovieDto , user , files);
  }

  @Get()
  findAll() {
    return this.moviesService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.moviesService.findOne(+id);
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
