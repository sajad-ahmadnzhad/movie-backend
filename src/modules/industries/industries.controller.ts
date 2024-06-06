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
  UpdateIndustryDecorator,
  RemoveIndustryDecorator,
  SearchIndustriesDecorator,
  GetIndustryByCountryDecorator,
} from "../../common/decorators/industries.decorator";
import { UserDecorator } from "../users/decorators/currentUser.decorator";
import { User } from "../users/schemas/User.schema";
import { IsValidObjectIdPipe } from "../../common/pipes/isValidObjectId.pipe";
import { PaginatedList } from "../../common/interfaces/public.interface";
import { Industry } from "./schemas/Industry.schema";
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

  @Get("search")
  @SearchIndustriesDecorator
  search(@Query("industry") industry: string) {
    return this.industriesService.search(industry);
  }

  @Get("by-country/:id")
  @GetIndustryByCountryDecorator
  findByCountry(
    @Param("id", IsValidObjectIdPipe) id: string
  ): Promise<Document[]> {
    return this.industriesService.findByCountry(id);
  }

  @Get(":id")
  @GetOneIndustryDecorator
  findOne(@Param("id", IsValidObjectIdPipe) id: string): Promise<Document> {
    return this.industriesService.findOne(id);
  }

  @Patch(":id")
  @UpdateIndustryDecorator
  async update(
    @Param("id") id: string,
    @Body() updateIndustryDto: UpdateIndustryDto,
    @UserDecorator() user: User
  ): Promise<{ message: string }> {
    const success = await this.industriesService.update(
      id,
      updateIndustryDto,
      user
    );
    return { message: success };
  }

  @Delete(":id")
  @RemoveIndustryDecorator
  async remove(
    @Param("id", IsValidObjectIdPipe) id: string,
    @UserDecorator() user: User
  ): Promise<{ message: string }> {
    const success = await this.industriesService.remove(id, user);
    return { message: success };
  }
}
