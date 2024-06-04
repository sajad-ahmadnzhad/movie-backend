import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document, ObjectId } from "mongoose";
import { Country } from "src/modules/countries/models/Country.model";
import { User } from "src/modules/users/models/User.model";

@Schema({ versionKey: false, timestamps: true })
export class Industry extends Document {
  @Prop({ type: String, unique: true, lowercase: true, required: true })
  name: string;

  @Prop({ type: String, required: true })
  description?: string;

  @Prop({ type: mongoose.Schema.ObjectId, ref: Country.name, required: true })
  country: ObjectId;

  @Prop({ type: mongoose.Schema.ObjectId, ref: User.name, required: true })
  createdBy: ObjectId;
}

const schema = SchemaFactory.createForClass(Industry)


export const IndustrySchema = schema