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
import { CountriesService } from "./countries.service";
import { CreateCountryDto } from "./dto/create-country.dto";
import { UpdateCountryDto } from "./dto/update-country.dto";
import { ApiTags } from "@nestjs/swagger";
import { UserDecorator } from "../users/decorators/currentUser.decorator";
import { User } from "../users/schemas/User.schema";
import {
  CreateCountryDecorator,
  GetAllCountriesDecorator,
  GetOneCountryDecorator,
  RemoveCountryDecorator,
  SearchCountriesDecorator,
  UpdateCountryDecorator,
} from "../../common/decorators/countries.decorator";
import { IsValidObjectIdPipe } from "../../common/pipes/isValidObjectId.pipe";
import { Document } from "mongoose";
import { Throttle } from "@nestjs/throttler";
import { PaginatedList } from '../../common/interfaces/public.interface';
import { Country } from "./schemas/Country.schema";

@Controller("countries")
@ApiTags("countries")
@Throttle({ default: { ttl: 60_000, limit: 30 } })
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Post()
  @CreateCountryDecorator
  async create(
    @Body() createCountryDto: CreateCountryDto,
    @UserDecorator() user: User,
    @UploadedFile() file?: Express.Multer.File
  ): Promise<{ message: string }> {
    const success = await this.countriesService.create(
      createCountryDto,
      user,
      file
    );

    return { message: success };
  }

  @Get()
  @GetAllCountriesDecorator
  findAll(
    @Query("page", new ParseIntPipe({ optional: true })) page?: number,
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number
  ): Promise<PaginatedList<Country>> {
    return this.countriesService.findAll(limit, page);
  }

  @Get("search")
  @SearchCountriesDecorator
  search(@Query("country") country: string): Promise<Array<Document>> {
    return this.countriesService.search(country);
  }

  @Get(":id")
  @GetOneCountryDecorator
  findOne(@Param("id", IsValidObjectIdPipe) id: string): Promise<Document> {
    return this.countriesService.findOne(id);
  }

  @Patch(":id")
  @UpdateCountryDecorator
  async update(
    @Param("id", IsValidObjectIdPipe) id: string,
    @Body() updateCountryDto: UpdateCountryDto,
    @UserDecorator() user: User,
    @UploadedFile() file?: Express.Multer.File
  ): Promise<{ message: string }> {
    const success = await this.countriesService.update(
      id,
      updateCountryDto,
      user,
      file
    );

    return { message: success };
  }

  @Delete(":id")
  @RemoveCountryDecorator
  async remove(
    @Param("id", IsValidObjectIdPipe) id: string,
    @UserDecorator() user: User
  ): Promise<{ message: string }> {
    const success = await this.countriesService.remove(id, user);

    return { message: success };
  }
}
