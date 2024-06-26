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
import { User } from "../users/schemas/User.schema";
import {
  CreateActorDecorator,
  GetActorsByCountry,
  GetActorsByIndustry,
  GetAllActorsDecorator,
  GetOneActorDecorator,
  SearchActorsDecorator,
  UpdateActorDecorator,
  RemoveActorDecorator,
} from "../../common/decorators/actors.decorator";
import { IsValidObjectIdPipe } from "../../common/pipes/isValidObjectId.pipe";
import { Document } from "mongoose";
import { Throttle } from "@nestjs/throttler";
import { PaginatedList } from "src/common/interfaces/public.interface";
import { Actor } from "./schemas/Actor.schema";

@Controller("actors")
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
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number
  ) {
    return this.actorsService.findAll(page, limit);
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
  findOne(@Param("id", IsValidObjectIdPipe) id: string): Promise<Document> {
    return this.actorsService.findOne(id);
  }

  @Get("by-country/:id")
  @GetActorsByCountry
  getActorsByCountry(@Param("id", IsValidObjectIdPipe) id: string) {
    return this.actorsService.findActorsByCountry(id);
  }

  @Get("by-industry/:id")
  @GetActorsByIndustry
  getActorsByIndustry(@Param("id", IsValidObjectIdPipe) id: string) {
    return this.actorsService.findActorsByIndustry(id);
  }

  @Patch(":id")
  @UpdateActorDecorator
  async update(
    @Param("id", IsValidObjectIdPipe) id: string,
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
    @Param("id", IsValidObjectIdPipe) id: string,
    @UserDecorator() user: User
  ): Promise<{ message: string }> {
    const success = await this.actorsService.remove(id, user);

    return { message: success };
  }
}
