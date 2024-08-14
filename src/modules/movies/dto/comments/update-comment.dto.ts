import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  Length,
  IsOptional,
  Max,
  Min,
  IsNumber,
  IsInt,
} from "class-validator";
import { Transform } from "class-transformer";

export class UpdateCommentDto {
  @IsString()
  @IsNotEmpty()
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

  @IsNotEmpty()
  @IsInt()
  @IsNumber()
  @Transform(({ value }) => +value)
  commentId: number;
}
