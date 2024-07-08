import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateIndustryDto } from "./dto/create-industry.dto";
import { UpdateIndustryDto } from "./dto/update-industry.dto";
import { IndustriesMessages } from "../../common/enum/industriesMessages.enum";
import { CountriesMessages } from "../../common/enum/countriesMessages.enum";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { RedisCache } from "cache-manager-redis-yet";
import {
  cachePagination,
  typeORMPagination,
} from "../../common/utils/pagination.util";
import { PaginatedList } from "../../common/interfaces/public.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Country } from "../countries/entities/country.entity";
import { Repository, FindManyOptions, Like } from "typeorm";
import { Industry } from "./entities/industry.entity";
import { User } from "../auth/entities/User.entity";
import { CountriesService } from "../countries/countries.service";

@Injectable()
export class IndustriesService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly redisCache: RedisCache,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @InjectRepository(Industry)
    private readonly industryRepository: Repository<Industry>,
    @Inject(forwardRef(() => CountriesService))
    private readonly countriesService: CountriesService
  ) {}

  async create(createIndustryDto: CreateIndustryDto, user: User) {
    const { name, description, countryId } = createIndustryDto;

    const existingCountry = await this.countryRepository.findOneBy({
      id: countryId,
    });

    if (!existingCountry) {
      throw new NotFoundException(CountriesMessages.NotFoundCountry);
    }

    const findDuplicatedKey = await this.industryRepository.findOneBy({ name });

    if (findDuplicatedKey) {
      throw new ConflictException(IndustriesMessages.AlreadyExistsIndustry);
    }

    await this.industryRepository
      .createQueryBuilder()
      .insert()
      .into(Industry)
      .values([
        {
          name,
          description,
          country: existingCountry,
          createdBy: user,
        },
      ])
      .execute();

    return IndustriesMessages.CreatedIndustrySuccess;
  }

  async findAll(page: number, limit: number): Promise<PaginatedList<Industry>> {
    const industriesCache = await this.redisCache.get<Industry[] | undefined>(
      "industries"
    );

    if (industriesCache) {
      return cachePagination(limit, page, industriesCache);
    }

    const options: FindManyOptions<Industry> = {
      relations: ["createdBy", "country"],
      order: { createdAt: "DESC" },
    };

    const industries = await this.industryRepository.find(options);

    await this.redisCache.set("industries", industries, 30_000);

    const paginatedIndustries = typeORMPagination(
      limit,
      page,
      this.industryRepository,
      options
    );

    return paginatedIndustries;
  }

  findOne(id: number): Promise<Industry> {
    return this.checkExistIndustry(id);
  }

  async findByCountry(id: number): Promise<Industry[]> {
    const country = await this.countriesService.checkExistCountry(id);

    const industries = await this.industryRepository
      .createQueryBuilder("industry")
      .leftJoinAndSelect("industry.country", "countries")
      .leftJoinAndSelect("industry.createdBy", "users")
      .where("industry.country.id = :id", { id: country.id })
      .orderBy("industry.createdAt", "DESC")
      .getMany();

    return industries;
  }

  search(
    industryQuery: string,
    limit?: number,
    page?: number
  ): Promise<PaginatedList<Industry>> {
    if (!industryQuery?.trim()) {
      throw new BadRequestException(IndustriesMessages.RequiredIndustryQuery);
    }

    const options: FindManyOptions<Industry> = {
      where: [
        { name: Like(`%${industryQuery}%`) },
        { description: Like(`%${industryQuery}%`) },
      ],

      relations: ["createdBy", "country"],
      order: { createdAt: "DESC" },
    };

    return typeORMPagination(limit, page, this.industryRepository, options);
  }

  async update(
    id: number,
    updateIndustryDto: UpdateIndustryDto,
    user: User
  ): Promise<string> {
    const { name, description, countryId } = updateIndustryDto;

    const industry = await this.checkExistIndustry(id);

    if (!industry.createdBy && !user.isSuperAdmin) {
      throw new ConflictException(
        IndustriesMessages.OnlySuperAdminCanUpdateIndustry
      );
    }

    let country: null | Country = null;
    if (countryId) {
      country = await this.countriesService.checkExistCountry(countryId);
    }

    if (industry.createdBy)
      if (user.id !== industry.createdBy.id && !user.isSuperAdmin) {
        throw new ForbiddenException(IndustriesMessages.CannotUpdateIndustry);
      }

    const findDuplicatedKey = await this.industryRepository
      .createQueryBuilder("industry")
      .where("industry.name = :name", { name })
      .andWhere("industry.id != :id", { id })
      .getOne();

    if (findDuplicatedKey) {
      throw new ConflictException(IndustriesMessages.AlreadyExistsIndustry);
    }

    await this.industryRepository.update(
      { id },
      { name, description, country: country || undefined }
    );

    return IndustriesMessages.UpdatedIndustrySuccess;
  }

  async remove(id: number, user: User): Promise<string> {
    const existingIndustry = await this.checkExistIndustry(id);

    if (!existingIndustry.createdBy && !user.isSuperAdmin) {
      throw new ConflictException(
        IndustriesMessages.OnlySuperAdminCanRemoveIndustry
      );
    }

    if (existingIndustry.createdBy)
      if (user.id !== existingIndustry.createdBy.id && !user.isSuperAdmin) {
        throw new ForbiddenException(IndustriesMessages.CannotRemoveIndustry);
      }

    await this.industryRepository.delete({ id });

    return IndustriesMessages.RemoveIndustrySuccess;
  }

   async checkExistIndustry(id: number): Promise<Industry> {
    const existingIndustry = await this.industryRepository.findOne({
      where: { id },
      relations: ["createdBy", "country"],
    });

    if (!existingIndustry) {
      throw new NotFoundException(IndustriesMessages.NotFoundIndustry);
    }

    return existingIndustry;
  }
}
