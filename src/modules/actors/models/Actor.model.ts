import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, ObjectId , Types } from "mongoose";
import { Country } from "src/modules/countries/models/Country.model";
import { User } from "src/modules/users/models/User.model";

@Schema({ versionKey: false, timestamps: true })
export class Actor extends Document {
  @Prop({ type: String, unique: true, lowercase: true, required: true })
  name: string;
  @Prop({ type: String })
  bio: string;
  @Prop({ type: String })
  avatar: string;
  @Prop({ type: Types.ObjectId, ref: Country.name , required: true })
  country: ObjectId;
  @Prop({ type: Types.ObjectId, ref: User.name , required: true })
  createdBy: ObjectId;
}

const schema = SchemaFactory.createForClass(Actor)

export { schema }