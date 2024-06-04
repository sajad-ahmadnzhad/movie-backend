import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateIndustryDto } from "./dto/create-industry.dto";
import { UpdateIndustryDto } from "./dto/update-industry.dto";
import { User } from "../users/models/User.model";
import { sendError } from "../../common/utils/functions.util";
import { InjectModel } from "@nestjs/mongoose";
import { Industry } from "./models/industry.model";
import { Model } from "mongoose";
import { Country } from "../countries/models/Country.model";
import { IndustriesMessages } from "../../common/enum/industriesMessages.enum";
import { CountriesMessages } from "../../common/enum/countriesMessages.enum";

@Injectable()
export class IndustriesService {
  constructor(
    @InjectModel(Industry.name) private readonly industryModel: Model<Industry>,
    @InjectModel(Country.name) private readonly countryModel: Model<Country>
  ) {}

  async create(createIndustryDto: CreateIndustryDto, user: User) {
    const existingCountry = await this.countryModel.findById(
      createIndustryDto.countryId
    );

    if (!existingCountry) {
      throw new NotFoundException(CountriesMessages.NotFoundCountry);
    }

    try {
      await this.industryModel.create({
        ...createIndustryDto,
        createdBy: user._id,
      });

      return IndustriesMessages.CreatedIndustrySuccess;
    } catch (error) {
      throw sendError(error.message, error.status);
    }
  }

  findAll() {
    return this.industryModel.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} industry`;
  }

  update(id: number, updateIndustryDto: UpdateIndustryDto) {
    return `This action updates a #${id} industry`;
  }

  remove(id: number) {
    return `This action removes a #${id} industry`;
  }
}
