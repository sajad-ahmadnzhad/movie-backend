import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateCountryDto } from "./dto/create-country.dto";
import { UpdateCountryDto } from "./dto/update-country.dto";
import { saveFile } from "../../common/utils/upload-file.util";
import { removeFile } from "../../common/utils/functions.util";
import { CountriesMessages } from "../../common/enum/countriesMessages.enum";
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
import { User } from "../auth/entities/User.entity";

@Injectable()
export class CountriesService {
  constructor(
    @Inject(CACHE_MANAGER) private redisCache: RedisCache,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>
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

    let filePath = file && saveFile(file, "country-flag");

    if (file) filePath = `/uploads/country-flag/${filePath}`;

    const country = this.countryRepository.create({
      ...createCountryDto,
      createdBy: user,
      flag_image_URL: filePath,
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

    await this.redisCache.set("countries", paginatedCountries.data, 30_000);

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

    const cacheKey = `searchCountry_${countryQuery}_${limit}_${page}`;

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

    await this.redisCache.set(cacheKey, paginatedCountries.data, 30_000);

    return paginatedCountries;
  }

  async update(
    id: number,
    updateCountryDto: UpdateCountryDto,
    user: User,
    file?: Express.Multer.File
  ): Promise<string> {
    const country = await this.checkExistCountry(id);

    if (!country.createdBy && !user.isSuperAdmin) {
      throw new ConflictException(
        CountriesMessages.OnlySuperAdminCanUpdateCountry
      );
    }

    if (country.createdBy)
      if (user.id !== country.createdBy.id && !user.isSuperAdmin) {
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

    let filePath = file && saveFile(file, "country-flag");

    if (file) filePath = `/uploads/country-flag/${filePath}`;

    await this.countryRepository.update(
      { id },
      {
        ...updateCountryDto,
        flag_image_URL: filePath,
      }
    );

    if (file) removeFile(country.flag_image_URL);

    return CountriesMessages.UpdatedCountrySuccess;
  }

  async remove(id: number, user: User): Promise<string> {
    const existingCountry = await this.checkExistCountry(id);

    if (!existingCountry.createdBy && !user.isSuperAdmin) {
      throw new ConflictException(
        CountriesMessages.OnlySuperAdminCanRemoveCountry
      );
    }

    if (existingCountry.createdBy)
      if (user.id !== existingCountry.createdBy.id && !user.isSuperAdmin) {
        throw new ForbiddenException(CountriesMessages.CannotRemoveCountry);
      }

    await this.countryRepository.delete({ id });

    removeFile(existingCountry.flag_image_URL);

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
