import { Transform } from "class-transformer";
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Max,
  Min,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { transformIds } from "../../../../common/utils/functions.util";
import { Actor } from '../../../actors/entities/actor.entity';
import { Genre } from '../../../genres/entities/genre.entity';
import { Industry } from '../../../industries/entities/industry.entity';

export class CreateMovieDto {
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @Length(5, 50)
  @ApiProperty({
    type: "string",
    maxLength: 50,
    minLength: 5,
    required: true,
  })
  title: string;

  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @IsString()
  @Length(5, 2000)
  @ApiProperty({
    type: "string",
    required: true,
    maxLength: 2000,
    minLength: 5,
  })
  description?: string;

  @Transform(({ value }) => +value)
  @Max(new Date().getFullYear())
  @Min(1980)
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    type: "number",
    required: true,
    maxLength: new Date().getFullYear(),
    minLength: 1980,
  })
  release_year: number;

  @IsArray()
  @Transform(transformIds)
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @ApiProperty({
    isArray: true,
    type: "array",
    uniqueItems: true,
    required: true,
    items: { type: "number" },
  })
  genres: Genre[];

  @IsArray()
  @Transform(transformIds)
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @ApiProperty({
    isArray: true,
    type: "array",
    uniqueItems: true,
    required: true,
    items: { type: "number" },
  })
  actors: Actor[];

  @IsArray()
  @Transform(transformIds)
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @ApiProperty({
    isArray: true,
    type: "array",
    uniqueItems: true,
    required: true,
    items: { type: "number" },
  })
  industries: Industry[];

  @ApiProperty({ type: "string", format: "binary", required: true })
  video: Express.Multer.File;

  @ApiProperty({ type: "string", format: "binary", required: true })
  poster: Express.Multer.File;
}
