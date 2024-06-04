import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export class CreateIndustryDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  @ApiProperty()
  name: string;
  @IsString()
  @IsOptional()
  @Length(5, 150)
  @ApiProperty({ required: false })
  description?: string;
}
