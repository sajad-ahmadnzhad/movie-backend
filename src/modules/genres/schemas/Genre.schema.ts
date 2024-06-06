import { ConflictException } from "@nestjs/common";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, ObjectId, Types } from "mongoose";
import { GenresMessages } from "src/common/enum/genresMessages.enum";
import { User } from "src/modules/users/schemas/User.schema";

@Schema({ versionKey: false, timestamps: true })
export class Genre extends Document {
  @Prop({
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: true,
  })
  name: string;
  @Prop({ type: String, trim: true })
  description: string;
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  createdBy: ObjectId;
}

const GenreSchema = SchemaFactory.createForClass(Genre);

GenreSchema.pre("save", async function (next) {
  try {
    const existingGenre = await this.model().findOne({ name: this.name });

    if (existingGenre) {
      throw new ConflictException(GenresMessages.AlreadyExistsGenre);
    }

    next();
  } catch (error) {
    next(error);
  }
});

export { GenreSchema };
