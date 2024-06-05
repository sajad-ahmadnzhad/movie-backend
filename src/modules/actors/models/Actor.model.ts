import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, ObjectId, Types } from "mongoose";
import { Country } from "../../../modules/countries/models/Country.model";
import { User } from "../../../modules/users/models/User.model";
import { Industry } from "src/modules/industries/models/Industry.model";
import { ConflictException } from "@nestjs/common";
import { ActorsMessages } from "src/common/enum/actorsMessages.enum";

@Schema({ versionKey: false, timestamps: true })
export class Actor extends Document {
  @Prop({ type: String, unique: true, lowercase: true, required: true })
  name: string;
  @Prop({ type: String })
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

export { ActorSchema };
