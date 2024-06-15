import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export class CreateCountryDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @Length(3, 50)
  @ApiProperty({
    maxLength: 50,
    minLength: 3,
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

  @ApiProperty({ type: "string", format: "binary", required: false })
  countryFlag: any;
}
