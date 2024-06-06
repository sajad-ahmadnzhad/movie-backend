import { ConflictException } from "@nestjs/common";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, ObjectId } from "mongoose";
import { Country } from "../../countries/schemas/Country.schema";
import { User } from "../../users/schemas/User.schema";
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

const IndustrySchema = SchemaFactory.createForClass(Industry);

IndustrySchema.pre("save", async function (next) {
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

IndustrySchema.pre(["find", "findOne"], function (next) {
  try {
    this.populate([
      {
        path: "country",
        select: "name description flag_image_URL",
        transform(doc) {
          doc && (doc.createdBy = undefined);
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

IndustrySchema.pre("updateOne", async function (next) {
  try {
    const industry = await this.model.findOne(this.getFilter());

    const updateData = this.getUpdate() as any;

    const existingIndustry = await this.model.findOne({
      name: updateData["$set"].name,
      _id: { $ne: industry._id },
    });

    if (existingIndustry) {
      throw new ConflictException(IndustriesMessages.AlreadyExistsIndustry);
    }
  } catch (error) {
    next(error);
  }
});

export { IndustrySchema };
