import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { ObjectId } from "mongoose";

@Schema({ versionKey: false, timestamps: true })
export class Country {
  @Prop({ type: String, unique: true, required: true })
  name: string;
  @Prop({ type: String })
  description: string;
  @Prop({ type: String })
  flag_image_URL: string;
  @Prop({ type: mongoose.Schema.ObjectId, ref: "users", required: true })
  createdBy: ObjectId;
}

const schema = SchemaFactory.createForClass(Country);

export const countrySchema = schema;
