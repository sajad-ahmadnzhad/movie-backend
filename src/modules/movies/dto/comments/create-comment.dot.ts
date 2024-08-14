import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from "class-validator";

export class CreateCommentDto {
  @IsNotEmpty()
  @Transform(({ value }) => +value)
  @IsNumber()
  @IsInt()
  @ApiProperty({ default: 1, type: "number" })
  movieId: number;
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  @ApiProperty({ type: "string" })
  @Length(5, 300)
  body: string;
  @IsOptional()
  @Transform(({ value }) => Math.round(+value))
  @ApiProperty({
    type: Number,
    required: false,
    default: 5,
    maximum: 5,
    minimum: 1,
  })
  @Max(5)
  @Min(1)
  @IsNumber()
  rating?: number;
}
