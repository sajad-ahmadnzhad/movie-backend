import {
  ArgumentMetadata,
  Injectable,
  NotFoundException,
  PipeTransform,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Actor } from "../../modules/actors/entities/actor.entity";
import { In, Repository } from "typeorm";
import { Industry } from "../../modules/industries/entities/industry.entity";
import { Genre } from "../../modules/genres/entities/genre.entity";
import { transformIds } from "../utils/functions.util";

@Injectable()
export class MovieRelationsValidationPipe implements PipeTransform {
  constructor(
    @InjectRepository(Actor)
    private readonly actorRepository: Repository<Actor>,
    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,
    @InjectRepository(Industry)
    private readonly industryRepository: Repository<Industry>
  ) {}

  async transform(value: string[], metadata: ArgumentMetadata) {
    const ids = transformIds({ value });

    const entityRepository = this.getRepository(metadata.data as string);
    const [foundedEntities, countEntities] =
      await entityRepository.findAndCountBy({ id: In(ids) });

    if (ids.length !== countEntities) {
      throw new NotFoundException(`One or more ${metadata.data} not found`);
    }

    return foundedEntities;
  }

  private getRepository(entityName: string): Repository<any> {
    const entities = {
      actors: this.actorRepository,
      genres: this.genreRepository,
      industries: this.industryRepository,
    };

    if (!entities[entityName]) {
      throw new NotFoundException(`Repository for ${entityName} not found`);
    }

    return entities[entityName];
  }
}
