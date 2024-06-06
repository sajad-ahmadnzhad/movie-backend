import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, ObjectId, Types } from "mongoose";
import { Country } from "../../countries/schemas/Country.schema";
import { User } from "../../users/schemas/User.schema";
import { Industry } from "../../industries/schemas/Industry.schema";
import { ConflictException } from "@nestjs/common";
import { ActorsMessages } from "../../../common/enum/actorsMessages.enum";
import { removeFile } from "../../../common/utils/functions.util";

@Schema({ versionKey: false, timestamps: true })
export class Actor extends Document {
  @Prop({
    type: String,
    trim: true,
    unique: true,
    lowercase: true,
    required: true,
  })
  name: string;
  @Prop({ type: String, trim: true })
  bio: string;
  @Prop({ type: String })
  photo: string;
  @Prop({ type: Types.ObjectId, ref: Country.name, required: true })
  country: ObjectId;
  @Prop({ type: Types.ObjectId, ref: Industry.name, required: true })
  industry: ObjectId;
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  createdBy: ObjectId;
}

const ActorSchema = SchemaFactory.createForClass(Actor);

ActorSchema.pre(["find", "findOne"], function (next) {
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
      {
        path: "industry",
        select: "name description",
        transform(doc) {
          doc && (doc.createdBy = undefined);
          doc && (doc.country = undefined);
          return doc;
        },
      },
    ]);

    next();
  } catch (error) {
    next(error);
  }
});

ActorSchema.pre("save", async function (next) {
  try {
    const existingIndustry = await this.model().findOne({
      name: this.name,
    });

    if (existingIndustry) {
      throw new ConflictException(ActorsMessages.AlreadyExistsActor);
    }
  } catch (error) {
    next(error);
  }
});

ActorSchema.pre("updateOne", async function (next) {
  try {
    const actor = await this.model.findOne(this.getFilter());

    const updateData: any = this.getUpdate();

    const existingActor = await this.model.findOne({
      name: updateData["$set"].name,
      _id: { $ne: actor._id },
    });

    if (existingActor) {
      throw new ConflictException(ActorsMessages.AlreadyExistsActor);
    }

    if (updateData["$set"].photo) {
      removeFile(actor.photo);
    }
  } catch (error) {
    next(error);
  }
});


ActorSchema.pre("deleteOne", async function (next) {
  try {
    const actor = await this.model.findOne(this.getFilter());

    removeFile(actor.photo)

    next();
  } catch (error) {
    next(error);
  }
});


export { ActorSchema };
