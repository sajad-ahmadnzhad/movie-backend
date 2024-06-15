import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from "class-validator";
import { PublicMessages } from "../../../common/enum/public.messages";
import { Transform } from "class-transformer";

export class CreateIndustryDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @Length(3, 50)
  @ApiProperty({
    maxLength: 50,
    minLength: 3,
  })
  name: string;
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  @Length(5, 150)
  @ApiProperty({ required: false, maxLength: 150, minLength: 5 })
  description?: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9a-fA-F]{24}$/, { message: PublicMessages.InvalidObjectId })
  @ApiProperty()
  countryId: string;
}
