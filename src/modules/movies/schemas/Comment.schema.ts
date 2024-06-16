import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, ObjectId, Types } from "mongoose";
import { User } from "../../users/schemas/User.schema";
import { Movie } from "./Movie.schema";

@Schema({ versionKey: false, timestamps: true })
export class Comment extends Document {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  creator: ObjectId;
  @Prop({ type: Types.ObjectId, ref: Movie.name, required: true })
  movieId: ObjectId;
  @Prop({ type: String, trim: true, required: true })
  body: string;
  @Prop({ type: Types.ObjectId, ref: Comment.name, default: null })
  parentComment: ObjectId;
  @Prop({ type: [Types.ObjectId], ref: Comment.name, default: [] })
  replies: [ObjectId];
  @Prop({ type: Boolean, default: false })
  isAccept: boolean;
  @Prop({ type: Boolean, default: false })
  isReject: boolean;
  @Prop({ type: Number, max: 5, min: 1, default: 5 })
  rating: number;
  @Prop({ type: Boolean, default: false })
  isEdit: boolean;
  @Prop({ type: Boolean, default: false })
  isReviewed: boolean;
}

const CommentSchema = SchemaFactory.createForClass(Comment);

export { CommentSchema };
