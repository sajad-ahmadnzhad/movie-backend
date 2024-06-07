import { Transform } from "class-transformer";
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  Length,
  Matches,
  Max,
} from "class-validator";
import { PublicMessages } from "../../../common/enum/public.messages";
import { ApiProperty } from "@nestjs/swagger";
import { ObjectId } from "mongoose";

export class CreateMovieDto {
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @Length(5, 50)
  @ApiProperty()
  title: string;
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @Length(5, 200)
  @ApiProperty({ required: false })
  description?: string;
  @Max(new Date().getFullYear())
  @IsNumber()
  @IsNotEmpty()
  release_year: number;
  @IsArray()
  @Matches(/^[0-9a-fA-F]{24}$/, { message: PublicMessages.InvalidObjectId })
  @ApiProperty()
  genres: [ObjectId];
  @IsArray()
  @Matches(/^[0-9a-fA-F]{24}$/, { message: PublicMessages.InvalidObjectId })
  @ApiProperty()
  actors: [ObjectId];
  @IsArray()
  @Matches(/^[0-9a-fA-F]{24}$/, { message: PublicMessages.InvalidObjectId })
  @ApiProperty()
  industries: [ObjectId];

  @ApiProperty({ type: "string", format: "binary", required: true })
  video: any;

  @ApiProperty({ type: "string", format: "binary", required: true })
  poster: any;
}
