import { ApiProperty } from "@nestjs/swagger";
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from "class-validator";
import { Transform } from "class-transformer";

export class CreateActorDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @ApiProperty({
    type: "string",
    required: true,
    maxLength: 50,
    minLength: 2,
    uniqueItems: true
  })
  @Length(2, 50)
  name: string;
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @Length(5, 100)
  @ApiProperty({
    type: "string",
    maxLength: 100,
    minLength: 5,
    required: false,
  })
  @IsOptional()
  bio?: string;

  @IsNotEmpty()
  @Transform(({ value }) => +value)
  @IsNumber()
  @IsInt()
  @ApiProperty({ type: "number", default: 1 , required: true })
  industryId: number;

  @ApiProperty({ type: "string", format: "binary", required: false })
  photo?: any;
}
