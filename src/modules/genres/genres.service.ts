import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CreateGenreDto } from "./dto/create-genre.dto";
import { UpdateGenreDto } from "./dto/update-genre.dto";
import { User } from "../users/schemas/User.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Genre } from "./schemas/Genre.schema";
import { Document, Model } from "mongoose";
import { GenresMessages } from "../../common/enum/genresMessages.enum";
import { sendError } from "../../common/utils/functions.util";
import { RedisCache } from "cache-manager-redis-yet";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { PaginatedList } from "../../common/interfaces/public.interface";
import {
  cachePagination,
  mongoosePagination,
} from "../../common/utils/pagination.util";

@Injectable()
export class GenresService {
  constructor(
    @InjectModel(Genre.name) private readonly genreModel: Model<Genre>,
    @Inject(CACHE_MANAGER) private readonly redisCache: RedisCache
  ) {}
  async create(createGenreDto: CreateGenreDto, user: User): Promise<string> {
    try {
      await this.genreModel.create({
        ...createGenreDto,
        createdBy: user._id,
      });

      return GenresMessages.CreatedGenreSuccess;
    } catch (error) {
      throw sendError(error.message, error.status);
    }
  }
  async findAll(limit?: number, page?: number): Promise<PaginatedList<Genre>> {
    const genresCache = await this.redisCache.get<Array<Genre>>("genres");

    if (genresCache) {
      return cachePagination(limit, page, genresCache);
    }

    const genres = await this.genreModel.find();
    await this.redisCache.set("genres", genres, 30_000);

    const query = this.genreModel.find();

    const mongoosePaginationResult = mongoosePagination(
      limit,
      page,
      query,
      this.genreModel
    );

    return mongoosePaginationResult;
  }

  async findOne(id: string): Promise<Document> {
    const existingGenre = await this.genreModel.findById(id);

    if (!existingGenre) {
      throw new NotFoundException(GenresMessages.NotFoundGenre);
    }

    return existingGenre;
  }
  update(id: number, updateGenreDto: UpdateGenreDto) {
    return `This action updates a #${id} genre`;
  }

  remove(id: number) {
    return `This action removes a #${id} genre`;
  }
}
