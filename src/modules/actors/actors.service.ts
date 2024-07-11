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
import { removeFile } from "../../common/utils/functions.util";
import { ActorsMessages } from "../../common/enum/actorsMessages.enum";
import { IndustriesMessages } from "../../common/enum/industriesMessages.enum";
import { PaginatedList } from "../../common/interfaces/public.interface";
import { saveFile } from "../../common/utils/upload-file.util";
import {
  cachePagination,
  typeORMPagination,
} from "../../common/utils/pagination.util";
import { IndustriesService } from "../industries/industries.service";
import { InjectRepository } from "@nestjs/typeorm";
import { FindManyOptions, Like, Repository } from "typeorm";
import { Actor } from "./entities/actor.entity";
import { Industry } from "../industries/entities/industry.entity";
import { User } from "../auth/entities/User.entity";
import { RedisCache } from "cache-manager-redis-yet";
import { CACHE_MANAGER } from "@nestjs/cache-manager";

@Injectable()
export class ActorsService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly redisCache: RedisCache,
    @Inject(forwardRef(() => IndustriesService))
    private readonly industriesService: IndustriesService,
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

    let filePath = file && saveFile(file, "actor-photo");

    if (filePath) filePath = `/uploads/actor-photo/${filePath}`;

    const actor = this.actorRepository.create({
      name,
      createdBy: user,
      country: industry.country,
      photo: filePath,
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
    const cacheKey = `actors_${countryId}_${industryId}_${page}_${limit}`;

    const actorsCache = await this.redisCache.get<Actor[] | undefined>(
      cacheKey
    );

    if (actorsCache) {
      return cachePagination(limit, page, actorsCache);
    }

    const options: FindManyOptions<Actor> = {
      where: {
        country: { id: countryId },
        industry: { id: industryId },
      },

      relations: ["country", "createdBy", "industry"],
      order: { createdAt: "DESC" },
    };

    const actorsPagination = await typeORMPagination(
      limit,
      page,
      this.actorRepository,
      options
    );

    await this.redisCache.set(cacheKey, actorsPagination.data, 30_000);

    return actorsPagination;
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

    const cacheKey = `searchActors_${actorQuery}_${limit}_${page}`;

    const actorsCache = await this.redisCache.get<Actor[] | undefined>(
      cacheKey
    );

    if (actorsCache) {
      return cachePagination(limit, page, actorsCache);
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
    };

    const paginatedActors = await typeORMPagination(
      limit,
      page,
      this.actorRepository,
      options
    );

    await this.redisCache.set(cacheKey, paginatedActors.data, 30_000);

    return paginatedActors;
  }

  async update(
    id: number,
    updateActorDto: UpdateActorDto,
    user: User,
    file?: Express.Multer.File
  ) {
    const { name, bio, industryId } = updateActorDto;

    const existingActor = await this.checkExistActor(id);

    if (!existingActor.createdBy && !user.isSuperAdmin) {
      throw new ConflictException(ActorsMessages.OnlySuperAdminCanUpdateActor);
    }

    if (existingActor.createdBy)
      if (user.id !== existingActor.createdBy.id && !user.isSuperAdmin) {
        throw new ForbiddenException(ActorsMessages.CannotUpdateActor);
      }

    let existingIndustry: null | Industry = null;

    if (industryId) {
      existingIndustry =
        await this.industriesService.checkExistIndustry(industryId);
    }

    const findDuplicatedKey = await this.actorRepository
      .createQueryBuilder("actors")
      .where("actors.name = :name", { name })
      .andWhere("actors.id != :id", { id })
      .getOne();

    if (findDuplicatedKey) {
      throw new ConflictException(ActorsMessages.AlreadyExistsActor);
    }

    let filePath = file && saveFile(file, "actor-photo");

    if (file) filePath = `/uploads/actor-photo/${filePath}`;

    await this.actorRepository.update(
      { id },
      {
        name,
        bio,
        industry: existingIndustry || undefined,
        country: existingIndustry?.country,
        photo: filePath,
      }
    );

    if (file) removeFile(filePath);

    return ActorsMessages.UpdatedActorSuccess;
  }

  async remove(id: number, user: User): Promise<string> {
    const existingActor = await this.checkExistActor(id);

    if (!existingActor.createdBy && !user.isSuperAdmin) {
      throw new ConflictException(ActorsMessages.OnlySuperAdminCanRemoveActor);
    }

    if (existingActor.createdBy)
      if (user.id !== existingActor.createdBy.id && !user.isSuperAdmin) {
        throw new ForbiddenException(ActorsMessages.CannotRemoveActor);
      }

    await this.actorRepository.delete({ id });
    removeFile(existingActor.photo);

    return ActorsMessages.RemoveActorSuccess;
  }

  private async checkExistActor(id: number): Promise<Actor> {
    const existingActor = await this.actorRepository.findOne({
      where: { id },
      relations: ["createdBy", "industry", "country"],
    });

    if (!existingActor) {
      throw new NotFoundException(ActorsMessages.NotFoundActor);
    }

    return existingActor;
  }
}
