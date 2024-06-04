import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from "class-validator";
import { PublicMessages } from "../../../common/enum/public.messages";

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

  @IsNotEmpty()
  @IsString()
  @Matches(/^[0-9a-fA-F]{24}$/, { message: PublicMessages.InvalidObjectId })
  @ApiProperty()
  countryId: string;
}
