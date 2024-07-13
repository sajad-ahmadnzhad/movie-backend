import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, IsString, Length, Max } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { ValidateIds } from "../../../../common/utils/custom-decorators";
import { transformIds } from "../../../../common/utils/functions.util";

export class CreateMovieDto {
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @Length(5, 50)
  @ApiProperty()
  title: string;

  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @IsString()
  @Length(5, 2000)
  @ApiProperty({ type: "string" })
  description: string;

  @Transform(({ value }) => +value)
  @Max(new Date().getFullYear())
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty()
  release_year: number;

  @ValidateIds()
  @Transform(transformIds)
  @ApiProperty({ isArray: true, type: "number" })
  genres: number[];

  @ValidateIds()
  @Transform(transformIds)
  @ApiProperty({ isArray: true, type: "number" })
  actors: number[];

  @ValidateIds()
  @Transform(transformIds)
  @ApiProperty({ isArray: true, type: "number" })
  industries: number[];

  @ApiProperty({ type: "string", format: "binary", required: true })
  video: any;

  @ApiProperty({ type: "string", format: "binary", required: true })
  poster: any;
}
