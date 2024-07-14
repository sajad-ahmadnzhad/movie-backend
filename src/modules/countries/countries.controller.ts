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
import {
  CreateCountryDecorator,
  GetAllCountriesDecorator,
  GetOneCountryDecorator,
  RemoveCountryDecorator,
  SearchCountriesDecorator,
  UpdateCountryDecorator,
} from "../../common/decorators/countries.decorator";
import { Throttle } from "@nestjs/throttler";
import { PaginatedList } from "../../common/interfaces/public.interface";
import { User } from "../auth/entities/User.entity";
import { Country } from "./entities/country.entity";

@Controller({
  path: "countries",
  version: "1.0.0",
})
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
  search(
    @Query("country") country: string,
    @Query("page", new ParseIntPipe({ optional: true })) page?: number,
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number
  ): Promise<PaginatedList<Country>> {
    return this.countriesService.search(country, limit, page);
  }

  @Get(":id")
  @GetOneCountryDecorator
  findOne(@Param("id", ParseIntPipe) id: number): Promise<Country> {
    return this.countriesService.findOne(id);
  }

  @Patch(":id")
  @UpdateCountryDecorator
  async update(
    @Param("id", ParseIntPipe) id: number,
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
    @Param("id", ParseIntPipe) id: number,
    @UserDecorator() user: User
  ): Promise<{ message: string }> {
    const success = await this.countriesService.remove(id, user);

    return { message: success };
  }
}
