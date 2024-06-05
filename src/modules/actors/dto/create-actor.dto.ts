import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from "class-validator";
import { ObjectId } from "mongoose";
import { PublicMessages } from "../../../common/enum/public.messages";

export class CreateActorDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @Length(2, 50)
  name: string;
  @IsString()
  @Length(5, 100)
  @ApiProperty({ required: false })
  @IsOptional()
  bio?: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ type: String })
  @Matches(/^[0-9a-fA-F]{24}$/, { message: PublicMessages.InvalidObjectId })
  industryId: ObjectId;

  @ApiProperty({ type: "string", format: "binary", required: false })
  photo: any;
}
