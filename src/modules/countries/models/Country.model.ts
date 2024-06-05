import { ConflictException } from "@nestjs/common";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, ObjectId } from "mongoose";
import { CountriesMessages } from "../../../common/enum/countriesMessages.enum";
import { removeFile } from "src/common/utils/functions.util";
import { User } from "src/modules/users/models/User.model";
import { Industry } from '../../industries/models/Industry.model';

@Schema({ versionKey: false, timestamps: true })
export class Country extends Document {
  @Prop({
    type: String,
    unique: true,
    trim: true,
    lowercase: true,
    required: true,
  })
  name: string;
  @Prop({ type: String, trim: true })
  description: string;
  @Prop({ type: String, trim: true })
  flag_image_URL: string;
  @Prop({ type: mongoose.Schema.ObjectId, ref: User.name, required: true })
  createdBy: ObjectId;
}

const schema = SchemaFactory.createForClass(Country);

schema.pre("save", async function (next) {
  try {
    const existingCountry = await this.model().findOne({ name: this.name });
    if (existingCountry) {
      throw new ConflictException(CountriesMessages.AlreadyExistsCountry);
    }

    next();
  } catch (error) {
    next(error);
  }
});

schema.pre("updateOne", async function (next) {
  try {
    const country = await this.model.findOne(this.getFilter());

    const updateData: any = this.getUpdate();

    const existingCountry = await this.model.findOne({
      name: updateData["$set"].name,
      _id: { $ne: country._id },
    });

    if (existingCountry) {
      throw new ConflictException(CountriesMessages.AlreadyExistsCountry);
    }

    if (updateData["$set"].flag_image_URL) {
      removeFile(country.flag_image_URL);
    }
  } catch (error) {
    next(error);
  }
});

schema.pre("deleteOne", async function (next) {
  try {
    const country = await this.model.findOne(this.getFilter());

    removeFile(country.flag_image_URL);

    //* Removal of all industries in the country

    next();
  } catch (error) {
    next(error);
  }
});

schema.pre(["find", "findOne"], function (next) {
  try {
    this.populate("createdBy", "name username avatarURL");
    next();
  } catch (error) {
    next(error);
  }
});

export const countrySchema = schema;
