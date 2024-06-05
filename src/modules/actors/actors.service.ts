import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateActorDto } from "./dto/create-actor.dto";
import { UpdateActorDto } from "./dto/update-actor.dto";
import { removeFile, sendError } from "../../common/utils/functions.util";
import { InjectModel } from "@nestjs/mongoose";
import { Actor } from "./models/Actor.model";
import { Model } from "mongoose";
import { Country } from "../countries/models/Country.model";
import { ActorsMessages } from "../../common/enum/actorsMessages.enum";
import { User } from "../users/models/User.model";
import { Industry } from "../industries/models/Industry.model";
import { IndustriesMessages } from "src/common/enum/industriesMessages.enum";
import { IIndustry } from "src/common/interfaces/public.interface";
import { saveFile } from "../../common/utils/upload-file.util";

@Injectable()
export class ActorsService {
  constructor(
    @InjectModel(Actor.name) private readonly actorModel: Model<Actor>,
    @InjectModel(Country.name) private readonly countryModel: Model<Country>,
    @InjectModel(Industry.name) private readonly industryModel: Model<Industry>
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

  findAll() {
    return this.actorModel.find();
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
