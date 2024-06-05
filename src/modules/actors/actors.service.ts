import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { CreateActorDto } from "./dto/create-actor.dto";
import { UpdateActorDto } from "./dto/update-actor.dto";
import { removeFile, sendError } from "../../common/utils/functions.util";
import { InjectModel } from "@nestjs/mongoose";
import { Actor } from "./models/Actor.model";
import { Model } from "mongoose";
import { ActorsMessages } from "../../common/enum/actorsMessages.enum";
import { User } from "../users/models/User.model";
import { Industry } from "../industries/models/Industry.model";
import { IndustriesMessages } from "../../common/enum/industriesMessages.enum";
import {
  IIndustry,
  PaginatedList,
} from "../../common/interfaces/public.interface";
import { saveFile } from "../../common/utils/upload-file.util";
import {
  cachePagination,
  mongoosePagination,
} from "../../common/utils/pagination.util";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { RedisCache } from "cache-manager-redis-yet";

@Injectable()
export class ActorsService {
  constructor(
    @InjectModel(Actor.name) private readonly actorModel: Model<Actor>,
    @InjectModel(Industry.name) private readonly industryModel: Model<Industry>,
    @Inject(CACHE_MANAGER) private readonly redisCache: RedisCache
  ) {}

  async create(
    createActorDto: CreateActorDto,
    user: User,
    file?: Express.Multer.File
  ): Promise<string> {
    const { name, bio, industryId } = createActorDto;

    const existingIndustry: IIndustry<Industry> | null =
      await this.industryModel.findById(industryId);

    if (!existingIndustry) {
      throw new NotFoundException(IndustriesMessages.NotFoundIndustry);
    }

    let filePath = file && saveFile(file, "actor-photo");

    if (filePath) filePath = `/uploads/actor-photo/${filePath}`;

    try {
      await this.actorModel.create({
        name,
        createdBy: user._id,
        country: existingIndustry.country._id,
        photo: filePath,
        bio,
        industry: industryId,
      });
      return ActorsMessages.CreatedActorSuccess;
    } catch (error) {
      removeFile(filePath);
      throw sendError(error.message, error.status);
    }
  }

  async findAll(page?: number, limit?: number): Promise<PaginatedList<Actor>> {
    const actorsCache = await this.redisCache.get<Array<Actor>>("actors");

    if (actorsCache) {
      return cachePagination(limit, page, actorsCache);
    }

    const actors = await this.actorModel.find();
    await this.redisCache.set("actors", actors, 30_000);

    const query = this.actorModel.find();

    const mongoosePaginationResult = mongoosePagination(
      limit,
      page,
      query,
      this.actorModel
    );

    return mongoosePaginationResult;
  }

  findOne(id: number) {
    return `This action returns a #${id} actor`;
  }

  update(id: number, updateActorDto: UpdateActorDto) {
    return `This action updates a #${id} actor`;
  }

  remove(id: number) {
    return `This action removes a #${id} actor`;
  }
}
