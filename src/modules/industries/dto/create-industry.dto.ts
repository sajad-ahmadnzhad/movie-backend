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

export class CreateIndustryDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @Length(3, 50)
  @ApiProperty({
    maxLength: 50,
    minLength: 3,
    required: true,
    uniqueItems: true,
    type: "string",
  })
  name: string;
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  @Length(5, 150)
  @ApiProperty({
    required: false,
    maxLength: 150,
    minLength: 5,
    type: "string",
  })
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  @IsInt()
  @ApiProperty({
    example: 1,
    type: "number",
    required: true,
    uniqueItems: true,
  })
  countryId: number;
}
