import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateCountryDto } from "./dto/create-country.dto";
import { UpdateCountryDto } from "./dto/update-country.dto";
import { CountriesMessages } from "../../common/enums/countriesMessages.enum";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { RedisCache } from "cache-manager-redis-yet";
import {
  cachePagination,
  typeORMPagination,
} from "../../common/utils/pagination.util";
import { PaginatedList } from "../../common/interfaces/public.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Country } from "./entities/country.entity";
import { FindManyOptions, Like, Repository } from "typeorm";
import { User } from "../auth/entities/user.entity";
import { Roles } from "../../common/enums/roles.enum";
import { S3Service } from "../s3/s3.service";

@Injectable()
export class CountriesService {
  constructor(
    @Inject(CACHE_MANAGER) private redisCache: RedisCache,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
    @Inject(forwardRef(() => S3Service)) private readonly s3Service: S3Service
  ) {}

  async create(
    createCountryDto: CreateCountryDto,
    user: User,
    file?: Express.Multer.File
  ): Promise<string> {
    const findDuplicatedKey = await this.countryRepository.findOneBy({
      name: createCountryDto.name,
    });

    if (findDuplicatedKey) {
      throw new ConflictException(CountriesMessages.AlreadyExistsCountry);
    }

    let flagImageUrl: string | null = null;
    if (file) {
      const flag = await this.s3Service.uploadFile(file, "countries-flag");
      flagImageUrl = flag.Location;
    }

    const country = this.countryRepository.create({
      ...createCountryDto,
      createdBy: user,
      flag_image_URL: flagImageUrl || undefined,
    });

    await this.countryRepository.save(country);

    return CountriesMessages.CreatedCountrySuccess;
  }

  async findAll(
    limit?: number,
    page?: number
  ): Promise<PaginatedList<Country>> {
    const countriesCache = await this.redisCache.get<Country[] | undefined>(
      "countries"
    );

    if (countriesCache) {
      return cachePagination(limit, page, countriesCache);
    }

    const options: FindManyOptions<Country> = {
      relations: ["createdBy"],
      order: { createdAt: "DESC" },
      select: {
        createdBy: {
          id: true,
          name: true,
          username: true,
          avatarURL: true,
        },
      },
    };

    const paginatedCountries = await typeORMPagination(
      limit,
      page,
      this.countryRepository,
      options
    );

    const countries = await this.countryRepository.find(options);
    await this.redisCache.set("countries", countries, 30_000);

    return paginatedCountries;
  }

  findOne(id: number): Promise<Country> {
    return this.checkExistCountry(id);
  }

  async search(
    countryQuery: string,
    limit?: number,
    page?: number
  ): Promise<PaginatedList<Country>> {
    if (!countryQuery?.trim()) {
      throw new BadRequestException(CountriesMessages.RequiredCountryQuery);
    }

    const cacheKey = `searchCountry_${countryQuery}`;

    const countriesCache = await this.redisCache.get<Country[] | undefined>(
      cacheKey
    );

    if (countriesCache) {
      return cachePagination(limit, page, countriesCache);
    }

    const options: FindManyOptions<Country> = {
      where: [
        {
          name: Like(`%${countryQuery}%`),
        },
        {
          description: Like(`%${countryQuery}%`),
        },
      ],
      relations: ["createdBy"],
      order: { createdAt: "DESC" },
      select: {
        createdBy: {
          id: true,
          name: true,
          username: true,
          avatarURL: true,
        },
      },
    };

    const paginatedCountries = await typeORMPagination(
      limit,
      page,
      this.countryRepository,
      options
    );

    const countries = await this.countryRepository.find(options);
    await this.redisCache.set(cacheKey, countries, 30_000);

    return paginatedCountries;
  }

  async update(
    id: number,
    updateCountryDto: UpdateCountryDto,
    user: User,
    file?: Express.Multer.File
  ): Promise<string> {
    const country = await this.checkExistCountry(id);

    if (!country.createdBy && user.role !== Roles.SUPER_ADMIN) {
      throw new ConflictException(
        CountriesMessages.OnlySuperAdminCanUpdateCountry
      );
    }

    if (country.createdBy)
      if (user.id !== country.createdBy.id && user.role !== Roles.SUPER_ADMIN) {
        throw new ForbiddenException(CountriesMessages.CannotUpdateCountry);
      }

    const existingCountry = await this.countryRepository
      .createQueryBuilder("country")
      .where("country.name = :name", { name: updateCountryDto.name })
      .andWhere("country.id != :id", { id })
      .getOne();

    if (existingCountry) {
      throw new ConflictException(CountriesMessages.AlreadyExistsCountry);
    }

    let flagImageUrl: string | null = null;
    if (file) {
      const flag = await this.s3Service.uploadFile(file, "countries-flag");
      flagImageUrl = flag.Location;
    }

    await this.countryRepository.update(
      { id },
      {
        ...updateCountryDto,
        flag_image_URL: flagImageUrl || undefined,
      }
    );

    if (file) {
      await this.s3Service.deleteFile(country.flag_image_URL);
    }

    return CountriesMessages.UpdatedCountrySuccess;
  }

  async remove(id: number, user: User): Promise<string> {
    const existingCountry = await this.checkExistCountry(id);

    if (!existingCountry.createdBy && user.role !== Roles.SUPER_ADMIN) {
      throw new ConflictException(
        CountriesMessages.OnlySuperAdminCanRemoveCountry
      );
    }

    if (existingCountry.createdBy)
      if (
        user.id !== existingCountry.createdBy.id &&
        user.role !== Roles.SUPER_ADMIN
      ) {
        throw new ForbiddenException(CountriesMessages.CannotRemoveCountry);
      }

    await this.countryRepository.delete({ id });

    if (existingCountry.flag_image_URL) {
      await this.s3Service.deleteFile(existingCountry.flag_image_URL);
    }

    return CountriesMessages.RemoveCountrySuccess;
  }

  async checkExistCountry(id: number): Promise<Country> {
    const existingCountry = await this.countryRepository.findOne({
      where: { id },
      relations: ["createdBy"],
      select: {
        createdBy: {
          id: true,
          name: true,
          username: true,
          avatarURL: true,
        },
      },
    });

    if (!existingCountry) {
      throw new NotFoundException(CountriesMessages.NotFoundCountry);
    }

    return existingCountry;
  }
}
