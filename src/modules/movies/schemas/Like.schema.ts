import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, ObjectId, Types } from "mongoose";
import { User } from "../../users/schemas/User.schema";
import { Movie } from "./Movie.schema";

@Schema({ versionKey: false, timestamps: true })
export class Like extends Document {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: ObjectId;
  @Prop({
    type: Types.ObjectId,
    ref: Movie.name,
    required: true,
    select: false,
  })
  movieId: ObjectId;
}

const LikeSchema = SchemaFactory.createForClass(Like);

LikeSchema.pre(["find", "findOne"], function (next) {
  try {
    this.populate({
      path: "userId",
      select: "name username avatarURL",
    });

    next();
  } catch (error) {
    next(error);
  }
});

export { LikeSchema };
