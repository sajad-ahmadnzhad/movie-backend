import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, ObjectId, Types } from "mongoose";

@Schema({ versionKey: false, timestamps: true })
export class User extends Document {
  @Prop({ type: String, required: true })
  email: string;
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  createdBy: ObjectId;
}

const BanUserSchema = SchemaFactory.createForClass(User);


export {BanUserSchema}