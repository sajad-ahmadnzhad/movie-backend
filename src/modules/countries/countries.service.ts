import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateCountryDto } from "./dto/create-country.dto";
import { UpdateCountryDto } from "./dto/update-country.dto";
import { Country } from "./models/Country.model";
import { Model } from "mongoose";
import { User } from "../users/models/User.model";
import { InjectModel } from "@nestjs/mongoose";
import { saveFile } from "../../common/utils/upload-file.util";
import { removeFile, sendError } from "../../common/utils/functions.util";
import { CountriesMessages } from "../../common/enum/countriesMessages.enum";

@Injectable()
export class CountriesService {
  constructor(
    @InjectModel(Country.name) private readonly countryModel: Model<Country>
  ) {}

  async create(
    createCountryDto: CreateCountryDto,
    user: User,
    file?: Express.Multer.File
  ): Promise<string> {
    let filePath = file && saveFile(file, "country-flag");

    if (file) filePath = `/uploads/country-flag/${filePath}`;

    try {
      await this.countryModel.create({
        ...createCountryDto,
        createdBy: user._id,
        flag_image_URL: filePath,
      });

      return CountriesMessages.CreatedCountrySuccess;
    } catch (error) {
      removeFile(filePath);
      throw sendError(error.message, error.status);
    }
  }

  findAll() {
    return this.countryModel.find();
  }

  findOne(id: number) {
    return this.countryModel.findById(id);
  }

  async update(
    id: string,
    updateCountryDto: UpdateCountryDto,
    user: User,
    file: Express.Multer.File
  ) {
    const existingCountry = await this.countryModel.findById(id);

    if (!existingCountry) {
      throw new NotFoundException(CountriesMessages.NotFoundCountry);
    }

    if (String(user._id) !== String(existingCountry.createdBy)) {
      if (!user.isSuperAdmin)
        throw new ForbiddenException(CountriesMessages.CannotUpdateCountry);
    }

    let filePath = file && saveFile(file, "country-flag");

    if (file) filePath = `/uploads/country-flag/${filePath}`;

    try {
      await existingCountry.updateOne({
        $set: {
          ...updateCountryDto,
          createdBy: user._id,
          flag_image_URL: filePath,
        },
      });

      return CountriesMessages.UpdatedCountrySuccess;
    } catch (error) {
      removeFile(filePath);
      throw sendError(error.message, error.status);
    }
  }

  async remove(id: string, user: User) {
    const existingCountry = await this.countryModel.findById(id);

    if (!existingCountry) {
      throw new NotFoundException(CountriesMessages.NotFoundCountry);
    }

    if (String(user._id) !== String(existingCountry.createdBy)) {
      if (!user.isSuperAdmin)
        throw new ForbiddenException(CountriesMessages.CannotRemoveCountry);
    }

    try {
      await existingCountry.deleteOne();
      return CountriesMessages.RemoveCountrySuccess
    } catch (error) {
      throw sendError(error.message, error.status);
    }
  }
}
