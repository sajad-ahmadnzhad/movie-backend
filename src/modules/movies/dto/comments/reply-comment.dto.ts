import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsString,
  IsNotEmpty,
  Length,
  IsOptional,
  Max,
  Min,
  IsNumber,
} from "class-validator";

export class ReplyCommentDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @Length(5, 300)
  body: string;
  @IsOptional()
  @Transform(({ value }) => +value)
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
