import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, ObjectId, Types } from "mongoose";
import { User } from "../../users/schemas/User.schema";
import { Movie } from "./Movie.schema";

@Schema({ versionKey: false, timestamps: true })
export class Bookmark extends Document {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: ObjectId;
  @Prop({ type: Types.ObjectId, ref: Movie.name, required: true })
  movieId: ObjectId;
}

const BookmarkSchema = SchemaFactory.createForClass(Bookmark);

BookmarkSchema.pre(["find", "findOne"], function (next) {
  try {
    this.populate([
      {
        path: "userId",
        select: "name username avatarURL",
      },
      {
        path: "movieId",
        select: "title description release_year poster_URL video_URL",
        transform(doc) {
          doc.createdBy = undefined
          doc.genres = undefined
          doc.countries = undefined
          doc.actors = undefined
          doc.industries = undefined
          return doc
        }
      },
    ]);
    next();
  } catch (error) {
    next(error);
  }
});

export { BookmarkSchema };
