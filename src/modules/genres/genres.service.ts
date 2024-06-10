import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
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
import {
  ICreatedBy,
  PaginatedList,
} from "../../common/interfaces/public.interface";
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

  search(genreQuery: string): Promise<Array<Document>> {
    if (!genreQuery?.trim()) {
      throw new BadRequestException(GenresMessages.RequiredGenreQuery);
    }

    const genres = this.genreModel.find({
      name: { $regex: genreQuery },
    });

    return genres;
  }

  findOne(id: string): Promise<Document> {
    return this.checkExistGenre(id);
  }

  async update(
    id: string,
    updateGenreDto: UpdateGenreDto,
    user: User
  ): Promise<string> {
    const existingGenre = await this.checkExistGenre(id);

    if (String(user._id) !== String(existingGenre.createdBy._id)) {
      if (!user.isSuperAdmin)
        throw new ForbiddenException(GenresMessages.CannotUpdateGenre);
    }

    try {
      await existingGenre.updateOne({
        $set: {
          ...updateGenreDto,
          createdBy: user._id,
        },
      });

      return GenresMessages.UpdatedGenreSuccess;
    } catch (error) {
      throw sendError(error.message, error.status);
    }
  }

  async remove(id: string, user: User): Promise<string> {
    const existingGenre = await this.checkExistGenre(id);

    if (String(user._id) !== String(existingGenre.createdBy._id)) {
      if (!user.isSuperAdmin)
        throw new ForbiddenException(GenresMessages.CannotRemoveGenre);
    }

    try {
      await existingGenre.deleteOne();
      return GenresMessages.RemoveGenreSuccess;
    } catch (error) {
      throw sendError(error.message, error.status);
    }
  }

  private async checkExistGenre(id: string): Promise<ICreatedBy<Genre>> {
    const existingGenre: ICreatedBy<Genre> | null =
      await this.genreModel.findById(id);

    if (!existingGenre) {
      throw new NotFoundException(GenresMessages.NotFoundGenre);
    }

    return existingGenre;
  }
}
