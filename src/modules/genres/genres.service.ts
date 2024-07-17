import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateGenreDto } from "./dto/create-genre.dto";
import { UpdateGenreDto } from "./dto/update-genre.dto";
import { User } from "../auth/entities/user.entity";
import { GenresMessages } from "../../common/enum/genresMessages.enum";
import { RedisCache } from "cache-manager-redis-yet";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { PaginatedList } from "../../common/interfaces/public.interface";
import {
  cachePagination,
  typeORMPagination,
} from "../../common/utils/pagination.util";
import { InjectRepository } from "@nestjs/typeorm";
import { Genre } from "./entities/genre.entity";
import { FindManyOptions, Like, Repository } from "typeorm";

@Injectable()
export class GenresService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly redisCache: RedisCache,
    @InjectRepository(Genre) private readonly genreRepository: Repository<Genre>
  ) {}
  async create(createGenreDto: CreateGenreDto, user: User): Promise<string> {
    const findDuplicatedKey = await this.genreRepository.findOneBy({
      name: createGenreDto.name,
    });

    if (findDuplicatedKey) {
      throw new ConflictException(GenresMessages.AlreadyExistsGenre);
    }

    const genre = this.genreRepository.create({
      ...createGenreDto,
      createdBy: user,
    });

    await this.genreRepository.save(genre);

    return GenresMessages.CreatedGenreSuccess;
  }

  async findAll(limit?: number, page?: number): Promise<PaginatedList<Genre>> {
    const genresCache = await this.redisCache.get<Genre[] | undefined>(
      "genres"
    );

    if (genresCache) {
      return cachePagination(limit, page, genresCache);
    }

    const options: FindManyOptions<Genre> = {
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

    const paginatedGenres = await typeORMPagination(
      limit,
      page,
      this.genreRepository,
      options
    );

    await this.redisCache.set("genres", paginatedGenres.data, 30_000);

    return paginatedGenres;
  }

  async search(
    genreQuery: string,
    limit?: number,
    page?: number
  ): Promise<PaginatedList<Genre>> {
    if (!genreQuery?.trim()) {
      throw new BadRequestException(GenresMessages.RequiredGenreQuery);
    }

    const cacheKey = `searchGenres_${genreQuery}_${limit}_${page}`;

    const genresCache = await this.redisCache.get<Genre[] | undefined>(
      cacheKey
    );

    if (genresCache) {
      return cachePagination(limit, page, genresCache);
    }

    const options: FindManyOptions<Genre> = {
      where: [
        {
          name: Like(`%${genreQuery}%`),
        },
        {
          description: Like(`%${genreQuery}%`),
        },
      ],
      order: { createdAt: "DESC" },
      relations: ["createdBy"],
      select: {
        createdBy: {
          id: true,
          name: true,
          username: true,
          avatarURL: true,
        },
      },
    };

    const paginatedGenres = await typeORMPagination(
      limit,
      page,
      this.genreRepository,
      options
    );

    await this.redisCache.set(cacheKey, paginatedGenres.data, 30_000);

    return paginatedGenres;
  }

  findOne(id: number): Promise<Genre> {
    return this.checkExistGenre(id);
  }

  async update(
    id: number,
    updateGenreDto: UpdateGenreDto,
    user: User
  ): Promise<string> {
    const genre = await this.checkExistGenre(id);

    if (!genre.createdBy && !user.isSuperAdmin) {
      throw new ConflictException(GenresMessages.OnlySuperAdminCanUpdateGenre);
    }

    if (genre.createdBy)
      if (user.id !== genre.createdBy.id && !user.isSuperAdmin) {
        throw new ForbiddenException(GenresMessages.CannotUpdateGenre);
      }

    const existingGenre = await this.genreRepository
      .createQueryBuilder("genre")
      .where("genre.name = :genre", { genre: updateGenreDto.name })
      .andWhere("genre.id != :id", { id })
      .getOne();

    if (existingGenre) {
      throw new ConflictException(GenresMessages.AlreadyExistsGenre);
    }

    await this.genreRepository.update({ id }, updateGenreDto);

    return GenresMessages.UpdatedGenreSuccess;
  }

  async remove(id: number, user: User): Promise<string> {
    const genre = await this.checkExistGenre(id);

    if (!genre.createdBy && !user.isSuperAdmin) {
      throw new ConflictException(GenresMessages.OnlySuperAdminCanRemoveGenre);
    }

    if (genre.createdBy)
      if (user.id !== genre.createdBy.id && !user.isSuperAdmin) {
        throw new ForbiddenException(GenresMessages.CannotRemoveGenre);
      }

    await this.genreRepository.delete({ id });

    return GenresMessages.RemoveGenreSuccess;
  }

  private async checkExistGenre(id: number): Promise<Genre> {
    const existingGenre = await this.genreRepository.findOne({
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

    if (!existingGenre) {
      throw new NotFoundException(GenresMessages.NotFoundGenre);
    }

    return existingGenre;
  }
}
