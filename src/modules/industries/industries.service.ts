import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CreateIndustryDto } from "./dto/create-industry.dto";
import { UpdateIndustryDto } from "./dto/update-industry.dto";
import { User } from "../users/models/User.model";
import { sendError } from "../../common/utils/functions.util";
import { InjectModel } from "@nestjs/mongoose";
import { Industry } from "./models/industry.model";
import { Document, Model } from "mongoose";
import { Country } from "../countries/models/Country.model";
import { IndustriesMessages } from "../../common/enum/industriesMessages.enum";
import { CountriesMessages } from "../../common/enum/countriesMessages.enum";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { RedisCache } from "cache-manager-redis-yet";
import {
  cachePagination,
  mongoosePagination,
} from "src/common/utils/pagination.util";
import { PaginatedList } from "src/common/interfaces/public.interface";

@Injectable()
export class IndustriesService {
  constructor(
    @InjectModel(Industry.name) private readonly industryModel: Model<Industry>,
    @InjectModel(Country.name) private readonly countryModel: Model<Country>,
    @Inject(CACHE_MANAGER) private readonly redisCache: RedisCache
  ) {}

  async create(createIndustryDto: CreateIndustryDto, user: User) {
    const existingCountry = await this.countryModel.findById(
      createIndustryDto.countryId
    );

    if (!existingCountry) {
      throw new NotFoundException(CountriesMessages.NotFoundCountry);
    }

    try {
      await this.industryModel.create({
        name: createIndustryDto.name,
        description: createIndustryDto.description,
        country: createIndustryDto.countryId,
        createdBy: user._id,
      });

      return IndustriesMessages.CreatedIndustrySuccess;
    } catch (error) {
      throw sendError(error.message, error.status);
    }
  }

  async findAll(page: number, limit: number): Promise<PaginatedList<Industry>> {
    const industriesCache =
      await this.redisCache.get<Array<Industry>>("industries");

    if (industriesCache) {
      return cachePagination(limit, page, industriesCache);
    }

    const industries = await this.industryModel.find();
    await this.redisCache.set("industries", industries, 30_000);

    const query = this.industryModel.find();

    const mongoosePaginationResult = mongoosePagination(
      limit,
      page,
      query,
      this.industryModel
    );

    return mongoosePaginationResult;
  }

  async findOne(id: string): Promise<Document> {
    const existingIndustry = await this.industryModel.findById(id);

    if (!existingIndustry) {
      throw new NotFoundException(IndustriesMessages.NotFoundIndustry);
    }

    return existingIndustry;
  }

  update(id: number, updateIndustryDto: UpdateIndustryDto) {
    return `This action updates a #${id} industry`;
  }

  remove(id: number) {
    return `This action removes a #${id} industry`;
  }
}
