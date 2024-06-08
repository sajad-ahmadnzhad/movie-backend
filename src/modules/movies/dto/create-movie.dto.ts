import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber, Length, Max } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { ValidateObjectIds } from "../../../common/utils/custom-decorators";

export class CreateMovieDto {
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @Length(5, 50)
  @ApiProperty()
  title: string;

  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @Length(5, 2000)
  @ApiProperty({ required: false })
  description?: string;

  @Transform(({ value }) => +value)
  @Max(new Date().getFullYear())
  @IsNumber()
  @IsNotEmpty()
  release_year: number;

  @ValidateObjectIds()
  @ApiProperty()
  genres: [string];

  @ValidateObjectIds()
  @ApiProperty()
  actors: [string];

  @ValidateObjectIds()
  @ApiProperty()
  industries: [string];

  @ApiProperty({ type: "string", format: "binary", required: true })
  // @IsNotEmpty()
  video: any;

  @ApiProperty({ type: "string", format: "binary", required: true })
  // @IsNotEmpty()
  poster: any;
}
