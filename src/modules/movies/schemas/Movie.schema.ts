import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, ObjectId, Types } from "mongoose";
import { Country } from "../../countries/schemas/Country.schema";
import { Genre } from "src/modules/genres/schemas/Genre.schema";
import { Actor } from "src/modules/actors/schemas/Actor.schema";
import { Industry } from "src/modules/industries/schemas/Industry.schema";

@Schema({ versionKey: false, timestamps: true })
export class Movie extends Document {
  @Prop({ type: String, trim: true, required: true })
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
  @Prop({ type: Types.ObjectId, ref: Industry.name, required: true })
  createdBy: ObjectId;
}

const MovieSchema = SchemaFactory.createForClass(Movie);

export { MovieSchema };
