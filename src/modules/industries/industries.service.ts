import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateIndustryDto } from "./dto/create-industry.dto";
import { UpdateIndustryDto } from "./dto/update-industry.dto";
import { User } from "../users/schemas/User.schema";
import { sendError } from "../../common/utils/functions.util";
import { InjectModel } from "@nestjs/mongoose";
import { Industry } from "./schemas/Industry.schema";
import { Document, Model } from "mongoose";
import { Country } from "../countries/schemas/Country.schema";
import { IndustriesMessages } from "../../common/enum/industriesMessages.enum";
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

  findOne(id: string): Promise<Document> {
    return this.checkExistIndustry(id);
  }

  async findByCountry(id: string): Promise<Document[]> {
    const existingCountry = await this.countryModel.findById(id);

    if (!existingCountry) {
      throw new NotFoundException(CountriesMessages.NotFoundCountry);
    }

    return this.industryModel.find({ country: id });
  }

  search(industryQuery: string): Promise<Document[]> {
    if (!industryQuery?.trim()) {
      throw new BadRequestException(IndustriesMessages.RequiredIndustryQuery);
    }

    const industries = this.industryModel.find({
      name: { $regex: industryQuery },
    });

    return industries;
  }

  async update(
    id: string,
    updateIndustryDto: UpdateIndustryDto,
    user: User
  ): Promise<string> {
    const existingIndustry = await this.checkExistIndustry(id);

    if (updateIndustryDto.countryId) {
      const existingCountry = await this.countryModel.findById(
        updateIndustryDto.countryId
      );

      if (!existingCountry)
        throw new NotFoundException(CountriesMessages.NotFoundCountry);
    }

    if (String(user._id) !== String(existingIndustry.createdBy._id)) {
      if (!user.isSuperAdmin)
        throw new ForbiddenException(IndustriesMessages.CannotUpdateIndustry);
    }

    try {
      await this.industryModel.updateOne({
        $set: {
          name: updateIndustryDto.name,
          description: updateIndustryDto.description,
          country: updateIndustryDto.countryId,
        },
      });
      return IndustriesMessages.UpdatedIndustrySuccess;
    } catch (error) {
      throw sendError(error.message, error.status);
    }
  }

  async remove(id: string, user: User): Promise<string> {
    const existingIndustry = await this.checkExistIndustry(id);

    if (String(user._id) !== String(existingIndustry.createdBy._id)) {
      if (!user.isSuperAdmin)
        throw new ForbiddenException(IndustriesMessages.CannotRemoveIndustry);
    }

    try {
      await existingIndustry.deleteOne();
      return IndustriesMessages.RemoveIndustrySuccess;
    } catch (error) {
      throw sendError(error.message, error.status);
    }
  }

  private async checkExistIndustry(id: string): Promise<ICreatedBy<Industry>> {
    const existingIndustry: ICreatedBy<Industry> | null =
      await this.industryModel.findById(id);

    if (!existingIndustry) {
      throw new NotFoundException(IndustriesMessages.NotFoundIndustry);
    }

    return existingIndustry;
  }
}
