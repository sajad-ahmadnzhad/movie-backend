import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, ObjectId, Types } from "mongoose";

@Schema({ versionKey: false, timestamps: true })
export class Token extends Document {
  @Prop({ type: Types.ObjectId, ref: "User", required: true, unique: true })
  userId: ObjectId;

  @Prop({ type: String, required: true })
  token: string;

  @Prop({ type: Date, expires: "10m", default: Date.now })
  createdAt: Date;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
