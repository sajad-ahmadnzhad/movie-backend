import { ConflictException } from "@nestjs/common";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { ObjectId } from "mongoose";
import { CountriesMessages } from "../../../common/enum/countriesMessages.enum";

@Schema({ versionKey: false, timestamps: true })
export class Country {
  @Prop({ type: String, unique: true, required: true })
  name: string;
  @Prop({ type: String })
  description: string;
  @Prop({ type: String })
  flag_image_URL: string;
  @Prop({ type: mongoose.Schema.ObjectId, ref: "users", required: true })
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

export const countrySchema = schema
