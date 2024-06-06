import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, ObjectId, Types } from "mongoose";
import { User } from "./User.schema";

@Schema({ versionKey: false, timestamps: true })
export class BanUser extends Document {
  @Prop({ type: String, required: true })
  email: string;
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  createdBy: ObjectId;
}

const BanUserSchema = SchemaFactory.createForClass(BanUser);


export {BanUserSchema}