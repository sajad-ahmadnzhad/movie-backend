import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  Query,
  ParseIntPipe,
} from "@nestjs/common";
import { ActorsService } from "./actors.service";
import { CreateActorDto } from "./dto/create-actor.dto";
import { UpdateActorDto } from "./dto/update-actor.dto";
import { ApiTags } from "@nestjs/swagger";
import { UserDecorator } from "../users/decorators/currentUser.decorator";
import {
  CreateActorDecorator,
  GetAllActorsDecorator,
  GetOneActorDecorator,
  SearchActorsDecorator,
  UpdateActorDecorator,
  RemoveActorDecorator,
} from "../../common/decorators/actors.decorator";
import { Throttle } from "@nestjs/throttler";
import { PaginatedList } from "../../common/interfaces/public.interface";
import { User } from "../auth/entities/User.entity";
import { Actor } from "./entities/actor.entity";

@Controller({
  path: "actors",
  version: "1",
})
@ApiTags("actors")
@Throttle({ default: { ttl: 60_000, limit: 30 } })
export class ActorsController {
  constructor(private readonly actorsService: ActorsService) {}

  @Post()
  @CreateActorDecorator
  async create(
    @Body() createActorDto: CreateActorDto,
    @UserDecorator() user: User,
    @UploadedFile() file?: Express.Multer.File
  ): Promise<{ message: string }> {
    const success = await this.actorsService.create(createActorDto, user, file);
    return { message: success };
  }

  @Get()
  @GetAllActorsDecorator
  findAll(
    @Query("page", new ParseIntPipe({ optional: true })) page?: number,
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number,
    @Query("countryId", new ParseIntPipe({ optional: true })) country?: number,
    @Query("industryId", new ParseIntPipe({ optional: true })) industry?: number
  ) {
    return this.actorsService.findAll(country, industry, page, limit);
  }

  @Get("search")
  @SearchActorsDecorator
  search(
    @Query("actor") actor: string,
    @Query("page", new ParseIntPipe({ optional: true })) page?: number,
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number
  ): Promise<PaginatedList<Actor>> {
    return this.actorsService.search(actor, limit, page);
  }

  @Get(":id")
  @GetOneActorDecorator
  findOne(@Param("id", ParseIntPipe) id: number): Promise<Actor> {
    return this.actorsService.findOne(id);
  }

  @Patch(":id")
  @UpdateActorDecorator
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateActorDto: UpdateActorDto,
    @UserDecorator() user: User,
    @UploadedFile() file?: Express.Multer.File
  ): Promise<{ message: string }> {
    const success = await this.actorsService.update(
      id,
      updateActorDto,
      user,
      file
    );
    return { message: success };
  }

  @Delete(":id")
  @RemoveActorDecorator
  async remove(
    @Param("id", ParseIntPipe) id: number,
    @UserDecorator() user: User
  ): Promise<{ message: string }> {
    const success = await this.actorsService.remove(id, user);

    return { message: success };
  }
}
