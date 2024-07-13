import { Transform } from "class-transformer";
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
  Max,
  Min,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { ValidateIds } from "../../../../common/utils/custom-decorators";
import { transformIds } from "../../../../common/utils/functions.util";

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

  @ValidateIds()
  @Transform(transformIds)
  @ApiProperty({
    isArray: true,
    type: "array",
    uniqueItems: true,
    required: true,
    items: { type: "number" },
  })
  genres: number[];

  @ValidateIds()
  @Transform(transformIds)
  @ApiProperty({
    isArray: true,
    type: "array",
    uniqueItems: true,
    required: true,
    items: { type: "number" },
  })
  actors: number[];

  @ValidateIds()
  @Transform(transformIds)
  @ApiProperty({
    isArray: true,
    type: "array",
    uniqueItems: true,
    required: true,
    items: { type: "number" },
  })
  industries: number[];

  @ApiProperty({ type: "string", format: "binary", required: true })
  video: any;

  @ApiProperty({ type: "string", format: "binary", required: true })
  poster: any;
}
