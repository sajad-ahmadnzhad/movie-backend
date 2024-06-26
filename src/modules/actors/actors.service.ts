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
import { Actor } from "./schemas/Actor.schema";
import { Document, Model } from "mongoose";
import { ActorsMessages } from "../../common/enum/actorsMessages.enum";
import { User } from "../users/schemas/User.schema";
import { Industry } from "../industries/schemas/Industry.schema";
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
import { Country } from "../countries/schemas/Country.schema";
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

  findOne(id: string): Promise<Document> {
    return this.checkExistActor(id);
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

  search(
    actorQuery: string,
    limit?: number,
    page?: number
  ): Promise<PaginatedList<Actor>> {
    if (!actorQuery?.trim()) {
      throw new BadRequestException(ActorsMessages.RequiredActorQuery);
    }

    const query = this.actorModel.find({
      name: { $regex: actorQuery },
    });
    const paginatedActors = mongoosePagination(
      limit,
      page,
      query,
      this.actorModel
    );

    return paginatedActors;
  }

  async update(
    id: string,
    updateActorDto: UpdateActorDto,
    user: User,
    file?: Express.Multer.File
  ) {
    const existingActor = await this.checkExistActor(id);

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

  async remove(id: string, user: User): Promise<string> {
    const existingActor = await this.checkExistActor(id);

    if (String(user._id) !== String(existingActor.createdBy._id)) {
      if (!user.isSuperAdmin)
        throw new ForbiddenException(ActorsMessages.CannotRemoveActor);
    }

    try {
      await existingActor.deleteOne();
      return ActorsMessages.RemoveActorSuccess;
    } catch (error) {
      throw sendError(error.message, error.status);
    }
  }

  private async checkExistActor(id: string): Promise<ICreatedBy<Actor>> {
    const existingActor: ICreatedBy<Actor> | null =
      await this.industryModel.findById(id);

    if (!existingActor) {
      throw new NotFoundException(ActorsMessages.NotFoundActor);
    }

    return existingActor;
  }
}
