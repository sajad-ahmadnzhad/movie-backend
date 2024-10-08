import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateActorDto } from "./dto/create-actor.dto";
import { UpdateActorDto } from "./dto/update-actor.dto";
import { ActorsMessages } from "../../common/enums/actorsMessages.enum";
import { IndustriesMessages } from "../../common/enums/industriesMessages.enum";
import { PaginatedList } from "../../common/interfaces/public.interface";
import { pagination } from "../../common/utils/pagination.util";
import { IndustriesService } from "../industries/industries.service";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, Like, Repository } from "typeorm";
import { Actor } from "./entities/actor.entity";
import { Industry } from "../industries/entities/industry.entity";
import { User } from "../auth/entities/user.entity";
import { RedisCache } from "cache-manager-redis-yet";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Roles } from "../../common/enums/roles.enum";
import { S3Service } from "../s3/s3.service";
import { PublicMessages } from "../../common/enums/publicMessages.enum";

@Injectable()
export class ActorsService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly redisCache: RedisCache,
    @Inject(forwardRef(() => IndustriesService))
    private readonly industriesService: IndustriesService,
    @Inject(forwardRef(() => S3Service))
    private readonly s3Service: S3Service,
    @InjectRepository(Industry)
    private readonly industryRepository: Repository<Industry>,
    @InjectRepository(Actor)
    private readonly actorRepository: Repository<Actor>
  ) {}

  async create(
    createActorDto: CreateActorDto,
    user: User,
    file?: Express.Multer.File
  ): Promise<string> {
    const { name, bio, industryId } = createActorDto;

    const findDuplicatedKey = await this.actorRepository.findOneBy({ name });

    if (findDuplicatedKey) {
      throw new ConflictException(ActorsMessages.AlreadyExistsActor);
    }

    const industry = await this.industryRepository.findOne({
      where: { id: industryId },
      relations: ["country"],
    });

    if (!industry) {
      throw new NotFoundException(IndustriesMessages.NotFoundIndustry);
    }

    let filePath: string | null = null;

    if (file) {
      const actorPhoto = await this.s3Service.uploadFile(file, "actors-photo");
      filePath = actorPhoto.Location;
    }

    const actor = this.actorRepository.create({
      name,
      createdBy: user,
      country: industry.country,
      photo: filePath || undefined,
      bio,
      industry,
    });

    await this.actorRepository.save(actor);

    return ActorsMessages.CreatedActorSuccess;
  }

  async findAll(
    countryId?: number,
    industryId?: number,
    page?: number,
    limit?: number
  ): Promise<PaginatedList<Actor>> {
    const cacheKey = `actors_${countryId ?? ""}_${industryId ?? ""}`;

    const actorsCache = await this.redisCache.get<Actor[] | undefined>(
      cacheKey
    );

    if (actorsCache) {
      return pagination(limit, page, actorsCache);
    }

    const options: FindManyOptions<Actor> = {
      where: {
        country: { id: countryId },
        industry: { id: industryId },
      },
      relations: ["country", "createdBy", "industry"],
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

    const actors = await this.actorRepository.find(options);
    await this.redisCache.set(cacheKey, actors, 30_000);

    return pagination(limit, page, actors);
  }

  findOne(id: number): Promise<Actor> {
    return this.checkExistActor(id);
  }

  async search(
    actorQuery: string,
    limit?: number,
    page?: number
  ): Promise<PaginatedList<Actor>> {
    if (!actorQuery?.trim()) {
      throw new BadRequestException(ActorsMessages.RequiredActorQuery);
    }

    const cacheKey = `searchActors_${actorQuery}`;

    const actorsCache = await this.redisCache.get<Actor[] | undefined>(
      cacheKey
    );

    if (actorsCache) {
      return pagination(limit, page, actorsCache);
    }

    const options: FindManyOptions<Actor> = {
      where: [
        {
          name: Like(`%${actorQuery}%`),
        },
        {
          bio: Like(`%${actorQuery}%`),
        },
      ],
      order: { createdAt: "DESC" },
      relations: ["createdBy", "country", "industry"],
      select: {
        createdBy: {
          id: true,
          name: true,
          username: true,
          avatarURL: true,
        },
      },
    };

    const actors = await this.actorRepository.find(options);
    await this.redisCache.set(cacheKey, actors, 30_000);

    return pagination(limit, page, actors);
  }

  async update(
    id: number,
    updateActorDto: UpdateActorDto,
    user: User,
    file?: Express.Multer.File
  ) {
    const { name, bio, industryId } = updateActorDto;

    if (!Object.keys(updateActorDto).length) {
      throw new BadRequestException(PublicMessages.BodyCannotBeEmpty);
    }

    const existingActor = await this.checkExistActor(id);

    if (!existingActor.createdBy && user.role !== Roles.SUPER_ADMIN) {
      throw new ConflictException(ActorsMessages.OnlySuperAdminCanUpdateActor);
    }

    if (existingActor.createdBy)
      if (
        user.id !== existingActor.createdBy.id &&
        user.role !== Roles.SUPER_ADMIN
      ) {
        throw new ForbiddenException(ActorsMessages.CannotUpdateActor);
      }

    let existingIndustry: null | Industry = null;

    if (industryId) {
      existingIndustry = await this.industriesService.checkExistIndustry(
        industryId
      );
    }

    const findDuplicatedActor = await this.actorRepository
      .createQueryBuilder("actors")
      .where("actors.name = :name", { name })
      .andWhere("actors.id != :id", { id })
      .getOne();

    if (findDuplicatedActor) {
      throw new ConflictException(ActorsMessages.AlreadyExistsActor);
    }

    let filePath: string | null = null;

    if (file) {
      const actorPhoto = await this.s3Service.uploadFile(file, "actors-photo");
      filePath = actorPhoto.Location;
    }

    await this.actorRepository.update(
      { id },
      {
        name,
        bio,
        industry: existingIndustry || undefined,
        country: existingIndustry?.country,
        photo: filePath || undefined,
      }
    );

    if (file) await this.s3Service.deleteFile(existingActor.photo);

    return ActorsMessages.UpdatedActorSuccess;
  }

  async remove(id: number, user: User): Promise<string> {
    const existingActor = await this.checkExistActor(id);

    if (!existingActor.createdBy && user.role !== Roles.SUPER_ADMIN) {
      throw new ConflictException(ActorsMessages.OnlySuperAdminCanRemoveActor);
    }

    if (existingActor.createdBy)
      if (
        user.id !== existingActor.createdBy.id &&
        user.role !== Roles.SUPER_ADMIN
      ) {
        throw new ForbiddenException(ActorsMessages.CannotRemoveActor);
      }

    await this.actorRepository.delete({ id });
    if (existingActor.photo) {
      await this.s3Service.deleteFile(existingActor.photo);
    }

    return ActorsMessages.RemoveActorSuccess;
  }

  private async checkExistActor(id: number): Promise<Actor> {
    const existingActor = await this.actorRepository.findOne({
      where: { id },
      relations: ["country", "industry", "createdBy"],
      select: {
        createdBy: {
          id: true,
          name: true,
          username: true,
          avatarURL: true,
        },
      },
    });

    if (!existingActor) {
      throw new NotFoundException(ActorsMessages.NotFoundActor);
    }

    return existingActor;
  }
}
