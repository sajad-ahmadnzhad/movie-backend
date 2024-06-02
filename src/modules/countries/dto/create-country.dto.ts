import { IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export class CreateCountryDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  name: string;
  @IsString()
  @IsOptional()
  @Length(5, 150)
  description?: string;
  @IsString()
  flag_image_URL?: string;
}
