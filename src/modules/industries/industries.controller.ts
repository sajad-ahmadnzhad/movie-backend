import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from "@nestjs/common";
import { IndustriesService } from "./industries.service";
import { CreateIndustryDto } from "./dto/create-industry.dto";
import { UpdateIndustryDto } from "./dto/update-industry.dto";
import { ApiTags } from "@nestjs/swagger";
import {
  CreateIndustryDecorator,
  GetAllIndustriesDecorator,
  GetOneIndustryDecorator,
} from "../../common/decorators/industries.decorator";
import { UserDecorator } from "../users/decorators/currentUser.decorator";
import { User } from "../users/models/User.model";
import { IsValidObjectIdPipe } from "../../common/pipes/isValidObjectId.pipe";
import { PaginatedList } from "../../common/interfaces/public.interface";
import { Industry } from "./models/industry.model";
import { Document } from "mongoose";

@Controller("industries")
@ApiTags("industries")
export class IndustriesController {
  constructor(private readonly industriesService: IndustriesService) {}

  @Post()
  @CreateIndustryDecorator
  async create(
    @Body() createIndustryDto: CreateIndustryDto,
    @UserDecorator() user: User
  ): Promise<{ message: string }> {
    const success = await this.industriesService.create(
      createIndustryDto,
      user
    );

    return { message: success };
  }

  @Get()
  @GetAllIndustriesDecorator
  findAll(
    @Query("page", new ParseIntPipe({ optional: true })) page: number,
    @Query("limit", new ParseIntPipe({ optional: true })) limit: number
  ): Promise<PaginatedList<Industry>> {
    return this.industriesService.findAll(page, limit);
  }

  @Get(":id")
  @GetOneIndustryDecorator
  findOne(@Param("id", IsValidObjectIdPipe) id: string): Promise<Document> {
    return this.industriesService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateIndustryDto: UpdateIndustryDto
  ) {
    return this.industriesService.update(+id, updateIndustryDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.industriesService.remove(+id);
  }
}
