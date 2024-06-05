import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from "class-validator";
import { ObjectId } from "mongoose";
import { PublicMessages } from "src/common/enum/public.messages";

export class CreateActorDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  name: string;
  @IsString()
  @Length(5, 100)
  @IsOptional()
  bio?: string;
  @IsString()
  @IsOptional()
  avatar?: string;
  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9a-fA-F]{24}$/, { message: PublicMessages.InvalidObjectId })
  country: ObjectId;
}
