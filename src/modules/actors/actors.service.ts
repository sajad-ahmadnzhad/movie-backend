import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateActorDto } from "./dto/create-actor.dto";
import { UpdateActorDto } from "./dto/update-actor.dto";
import { removeFile, sendError } from "../../common/utils/functions.util";
import { InjectModel } from "@nestjs/mongoose";
import { Actor } from "./models/Actor.model";
import { Document, Model } from "mongoose";
import { ActorsMessages } from "../../common/enum/actorsMessages.enum";
import { User } from "../users/models/User.model";
import { Industry } from "../industries/models/Industry.model";
import { IndustriesMessages } from "../../common/enum/industriesMessages.enum";
import {
  ICreatedBy,
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
import { Country } from "../countries/models/Country.model";
import { CountriesMessages } from "../../common/enum/countriesMessages.enum";

@Injectable()
export class ActorsService {
  constructor(
    @InjectModel(Actor.name) private readonly actorModel: Model<Actor>,
    @InjectModel(Industry.name) private readonly industryModel: Model<Industry>,
    @InjectModel(Country.name) private readonly countryModel: Model<Industry>,
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

  async findOne(id: string): Promise<Document> {
    const existingActor = await this.actorModel.findById(id);

    if (!existingActor) {
      throw new NotFoundException(ActorsMessages.NotFoundActor);
    }

    return existingActor;
  }

  async findActorsByCountry(id: string): Promise<Document[]> {
    const existingCountry = await this.countryModel.findById(id);

    if (!existingCountry) {
      throw new NotFoundException(CountriesMessages.NotFoundCountry);
    }

    const actors = this.actorModel.find({
      $or: [{ country: id }, { country: existingCountry._id }],
    });

    return actors;
  }

  async findActorsByIndustry(id: string): Promise<Document[]> {
    const existingIndustry = await this.industryModel.findById(id);

    if (!existingIndustry) {
      throw new NotFoundException(IndustriesMessages.NotFoundIndustry);
    }

    const actors = this.actorModel.find({
      $or: [{ industry: id }, { industry: existingIndustry._id }],
    });

    return actors;
  }

  search(actorQuery: string): Promise<Array<Document>> {
    if (!actorQuery?.trim()) {
      throw new BadRequestException(ActorsMessages.RequiredActorQuery);
    }

    const actors = this.actorModel.find({
      name: { $regex: actorQuery },
    });

    return actors;
  }

  async update(
    id: string,
    updateActorDto: UpdateActorDto,
    user: User,
    file?: Express.Multer.File
  ) {
    const existingActor: ICreatedBy<Actor> | null =
      await this.actorModel.findById(id);

    if (!existingActor) {
      throw new NotFoundException(ActorsMessages.NotFoundActor);
    }

    const existingIndustry: IIndustry<Industry> | null | undefined =
      updateActorDto.industryId &&
      (await this.industryModel.findById(updateActorDto.industryId));

    if (updateActorDto.industryId && !existingIndustry)
      throw new NotFoundException(IndustriesMessages.NotFoundIndustry);

    if (String(user._id) !== String(existingActor.createdBy._id)) {
      if (!user.isSuperAdmin)
        throw new ForbiddenException(ActorsMessages.CannotUpdateActor);
    }

    let filePath = file && saveFile(file, "actor-photo");

    if (file) filePath = `/uploads/actor-photo/${filePath}`;

    try {
      await existingActor.updateOne({
        $set: {
          name: updateActorDto.name,
          bio: updateActorDto.bio,
          industry: updateActorDto.industryId,
          createdBy: user._id,
          photo: filePath,
          country: existingIndustry?.country._id,
        },
      });

      return ActorsMessages.UpdatedActorSuccess;
    } catch (error) {
      removeFile(filePath);
      throw sendError(error.message, error.status);
    }
  }

  remove(id: number) {
    return `This action removes a #${id} actor`;
  }
}
