import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateCountryDto } from "./dto/create-country.dto";
import { UpdateCountryDto } from "./dto/update-country.dto";
import { Country } from "./schemas/Country.schema";
import { Document, Model } from "mongoose";
import { User } from "../users/schemas/User.schema";
import { InjectModel } from "@nestjs/mongoose";
import { saveFile } from "../../common/utils/upload-file.util";
import { removeFile, sendError } from "../../common/utils/functions.util";
import { CountriesMessages } from "../../common/enum/countriesMessages.enum";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { RedisCache } from "cache-manager-redis-yet";
import {
  cachePagination,
  mongoosePagination,
} from "../../common/utils/pagination.util";
import {
  ICreatedBy,
  PaginatedList,
} from "../../common/interfaces/public.interface";

@Injectable()
export class CountriesService {
  constructor(
    @InjectModel(Country.name) private readonly countryModel: Model<Country>,
    @Inject(CACHE_MANAGER) private redisCache: RedisCache
  ) {}

  async create(
    createCountryDto: CreateCountryDto,
    user: User,
    file?: Express.Multer.File
  ): Promise<string> {
    let filePath = file && saveFile(file, "country-flag");

    if (file) filePath = `/uploads/country-flag/${filePath}`;

    try {
      await this.countryModel.create({
        ...createCountryDto,
        createdBy: user._id,
        flag_image_URL: filePath,
      });

      return CountriesMessages.CreatedCountrySuccess;
    } catch (error) {
      removeFile(filePath);
      throw sendError(error.message, error.status);
    }
  }

  async findAll(
    limit?: number,
    page?: number
  ): Promise<PaginatedList<Country>> {
    const countriesCache =
      await this.redisCache.get<Array<Country>>("countries");

    if (countriesCache) {
      return cachePagination(limit, page, countriesCache);
    }

    const countries = await this.countryModel.find();
    await this.redisCache.set("countries", countries, 30_000);

    const query = this.countryModel.find();

    const mongoosePaginationResult = mongoosePagination(
      limit,
      page,
      query,
      this.countryModel
    );

    return mongoosePaginationResult;
  }

  findOne(id: string): Promise<Document> {
    return this.checkExistCountry(id);
  }

  search(
    countryQuery: string,
    limit?: number,
    page?: number
  ): Promise<PaginatedList<Country>> {
    if (!countryQuery?.trim()) {
      throw new BadRequestException(CountriesMessages.RequiredCountryQuery);
    }

    const query = this.countryModel.find({
      name: { $regex: countryQuery },
    });

    const paginatedCountries = mongoosePagination(
      limit,
      page,
      query,
      this.countryModel
    );

    return paginatedCountries;
  }

  async update(
    id: string,
    updateCountryDto: UpdateCountryDto,
    user: User,
    file?: Express.Multer.File
  ): Promise<string> {
    const existingCountry = await this.checkExistCountry(id);

    if (String(user._id) !== String(existingCountry.createdBy._id)) {
      if (!user.isSuperAdmin)
        throw new ForbiddenException(CountriesMessages.CannotUpdateCountry);
    }

    let filePath = file && saveFile(file, "country-flag");

    if (file) filePath = `/uploads/country-flag/${filePath}`;

    try {
      await existingCountry.updateOne({
        $set: {
          ...updateCountryDto,
          createdBy: user._id,
          flag_image_URL: filePath,
        },
      });

      return CountriesMessages.UpdatedCountrySuccess;
    } catch (error) {
      removeFile(filePath);
      throw sendError(error.message, error.status);
    }
  }

  async remove(id: string, user: User): Promise<string> {
    const existingCountry = await this.checkExistCountry(id);

    if (String(user._id) !== String(existingCountry.createdBy._id)) {
      if (!user.isSuperAdmin)
        throw new ForbiddenException(CountriesMessages.CannotRemoveCountry);
    }

    try {
      await existingCountry.deleteOne();
      return CountriesMessages.RemoveCountrySuccess;
    } catch (error) {
      throw sendError(error.message, error.status);
    }
  }

  private async checkExistCountry(id: string): Promise<ICreatedBy<Country>> {
    const existingCountry: ICreatedBy<Country> | null =
      await this.countryModel.findById(id);

    if (!existingCountry) {
      throw new NotFoundException(CountriesMessages.NotFoundCountry);
    }

    return existingCountry;
  }
}
