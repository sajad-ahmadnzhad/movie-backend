import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
} from "class-validator";
import { PublicMessages } from "../../../../common/enum/public.messages";

export class CreateCommentDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  @Matches(/^[0-9a-fA-F]{24}$/, { message: PublicMessages.InvalidObjectId })
  movieId: string;
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
