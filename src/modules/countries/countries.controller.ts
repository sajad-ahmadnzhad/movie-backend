import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
} from "@nestjs/common";
import { CountriesService } from "./countries.service";
import { CreateCountryDto } from "./dto/create-country.dto";
import { UpdateCountryDto } from "./dto/update-country.dto";
import { ApiCookieAuth, ApiTags } from "@nestjs/swagger";
import { UserDecorator } from "../users/decorators/currentUser.decorator";
import { User } from "../users/models/User.model";
import { CreateCountryDecorator } from "src/common/decorators/countries.decorator";

@Controller("countries")
@ApiCookieAuth()
@ApiTags("countries")
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Post()
  @CreateCountryDecorator
  create(
    @Body() createCountryDto: CreateCountryDto,
    @UserDecorator() user: User,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.countriesService.create(createCountryDto, user, file);
  }

  @Get()
  findAll() {
    return this.countriesService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.countriesService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateCountryDto: UpdateCountryDto) {
    return this.countriesService.update(+id, updateCountryDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.countriesService.remove(+id);
  }
}
