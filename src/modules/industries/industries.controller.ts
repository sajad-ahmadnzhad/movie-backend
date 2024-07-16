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
} from "../../common/decorators/industries.decorator";
import { UserDecorator } from "../users/decorators/currentUser.decorator";
import { PaginatedList } from "../../common/interfaces/public.interface";
import { User } from "../auth/entities/User.entity";
import { Industry } from "./entities/industry.entity";

@Controller({
  path: "industries",
  version: "1",
})
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
    @Query("country", new ParseIntPipe({ optional: true })) country?: number,
    @Query("page", new ParseIntPipe({ optional: true })) page?: number,
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number,
  ): Promise<PaginatedList<Industry>> {
    return this.industriesService.findAll(page, limit , country);
  }

  @Get("search")
  @SearchIndustriesDecorator
  search(
    @Query("industry") industry: string,
    @Query("page", new ParseIntPipe({ optional: true })) page: number,
    @Query("limit", new ParseIntPipe({ optional: true })) limit: number
  ): Promise<PaginatedList<Industry>> {
    return this.industriesService.search(industry, limit, page);
  }

  @Get(":id")
  @GetOneIndustryDecorator
  findOne(@Param("id", ParseIntPipe) id: number): Promise<Industry> {
    return this.industriesService.findOne(id);
  }

  @Patch(":id")
  @UpdateIndustryDecorator
  async update(
    @Param("id", ParseIntPipe) id: number,
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
    @Param("id", ParseIntPipe) id: number,
    @UserDecorator() user: User
  ): Promise<{ message: string }> {
    const success = await this.industriesService.remove(id, user);
    return { message: success };
  }
}
