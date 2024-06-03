import { Injectable } from "@nestjs/common";
import { CreateCountryDto } from "./dto/create-country.dto";
import { UpdateCountryDto } from "./dto/update-country.dto";
import { Country } from "./models/Country.model";
import { Model } from "mongoose";
import { User } from "../users/models/User.model";
import { InjectModel } from "@nestjs/mongoose";
import { saveFile } from "src/common/utils/upload-file.util";
import { removeFile, sendError } from "src/common/utils/functions.util";
import { CountriesMessages } from "src/common/enum/countriesMessages.enum";

@Injectable()
export class CountriesService {
  constructor(
    @InjectModel(Country.name) private readonly countryModel: Model<Country>
  ) {}

  async create(
    createCountryDto: CreateCountryDto,
    user: User,
    file?: Express.Multer.File
  ) {
    let filePath = file && saveFile(file, "country-flag");

    if (file) filePath = `/uploads/country-flag/${filePath}`;

    try {
      await this.countryModel.create({
        ...createCountryDto,
        createdBy: user._id,
        flag_image_URL: filePath,
      });

      return CountriesMessages.CreatedSuccess;
    } catch (error) {
      removeFile(filePath);
      throw sendError(error.message, error.status);
    }
  }

  findAll() {
    return `This action returns all countries`;
  }

  findOne(id: number) {
    return `This action returns a #${id} country`;
  }

  update(id: number, updateCountryDto: UpdateCountryDto) {
    return `This action updates a #${id} country`;
  }

  remove(id: number) {
    return `This action removes a #${id} country`;
  }
}
