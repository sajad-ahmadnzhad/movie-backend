import { ConflictException } from "@nestjs/common";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, ObjectId } from "mongoose";
import { Country } from "../../countries/models/Country.model";
import { User } from "../../users/models/User.model";
import { IndustriesMessages } from "../../../common/enum/industriesMessages.enum";

@Schema({ versionKey: false, timestamps: true })
export class Industry extends Document {
  @Prop({
    type: String,
    trim: true,
    unique: true,
    lowercase: true,
    required: true,
  })
  name: string;

  @Prop({ type: String, trim: true })
  description?: string;

  @Prop({ type: mongoose.Schema.ObjectId, ref: Country.name, required: true })
  country: ObjectId;

  @Prop({ type: mongoose.Schema.ObjectId, ref: User.name, required: true })
  createdBy: ObjectId;
}

const schema = SchemaFactory.createForClass(Industry);

schema.pre("save", async function (next) {
  try {
    const existingIndustry = await this.model().findOne({ name: this.name });
    
    if (existingIndustry) {
      throw new ConflictException(IndustriesMessages.AlreadyExistsIndustry);
    }

    next();
  } catch (error) {
    next(error);
  }
});

schema.pre(["find", "findOne"], function (next) {
  try {
    this.populate([
      {
        path: "country",
        select: "name description flag_image_URL",
        transform(doc) {
          doc.createdBy = undefined;
          return doc;
        },
      },
      {
        path: "createdBy",
        select: "name username avatarURL",
      },
    ]);

    next();
  } catch (error) {
    next(error);
  }
});

export const IndustrySchema = schema;
