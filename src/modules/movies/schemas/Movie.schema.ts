import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, ObjectId, Types } from "mongoose";
import { Country } from "../../countries/schemas/Country.schema";
import { Genre } from "../../genres/schemas/Genre.schema";
import { Actor } from "../../actors/schemas/Actor.schema";
import { Industry } from "../../industries/schemas/Industry.schema";
import { User } from "../../users/schemas/User.schema";
import { removeFile } from "../../../common/utils/functions.util";

@Schema({ versionKey: false, timestamps: true })
export class Movie extends Document {
  @Prop({ type: String, trim: true, lowercase: true, required: true })
  title: string;
  @Prop({ type: String, trim: true })
  description?: string;
  @Prop({ type: Number, required: true })
  release_year: number;
  @Prop({ type: String, required: true })
  poster_URL: string;
  @Prop({ type: String, required: true })
  video_URL: string;
  @Prop({ type: [Types.ObjectId], ref: Country.name, required: true })
  countries: [ObjectId];
  @Prop({ type: [Types.ObjectId], ref: Genre.name, required: true })
  genres: [ObjectId];
  @Prop({ type: [Types.ObjectId], ref: Actor.name, required: true })
  actors: [ObjectId];
  @Prop({ type: [Types.ObjectId], ref: Industry.name, required: true })
  industries: [ObjectId];
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  createdBy: ObjectId;
}

const MovieSchema = SchemaFactory.createForClass(Movie);

MovieSchema.pre(["find", "findOne"], function (next) {
  try {
    this.populate([
      {
        path: "genres",
        select: "name",
        transform(docs) {
          docs && (docs.createdBy = undefined);
          return docs;
        },
      },
      {
        path: "industries",
        select: "name",
        transform(docs) {
          docs && (docs.createdBy = undefined);
          docs && (docs.country = undefined);
          return docs;
        },
      },
      {
        path: "actors",
        select: "name photo",
        transform(docs) {
          docs && (docs.createdBy = undefined);
          docs && (docs.industry = undefined);
          docs && (docs.country = undefined);
          return docs;
        },
      },
      {
        path: "createdBy",
        select: "name username avatarURL",
      },
      {
        path: "countries",
        select: "name",
        transform(docs) {
          docs && (docs.createdBy = undefined);
          return docs;
        },
      },
    ]);
    next();
  } catch (error) {
    next(error);
  }
});

MovieSchema.pre("deleteOne", async function (next) {
  try {
    const movie = await this.model.findOne(this.getFilter());

    removeFile(movie.poster_URL);
    removeFile(movie.video_URL);

    next();
  } catch (error) {
    next(error);
  }
});

MovieSchema.pre("updateOne", async function (next) {
  try {
    const movie = await this.model.findOne(this.getFilter());
    const newData: any = this.getUpdate();

    if (newData["$set"].poster_URL) removeFile(movie.poster_URL);
    if (newData["$set"].video_URL) removeFile(movie.video_URL);

    next();
  } catch (error) {
    next(error);
  }
});

export { MovieSchema };
