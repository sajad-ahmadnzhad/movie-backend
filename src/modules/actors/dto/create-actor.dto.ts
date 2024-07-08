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
  @ApiProperty()
  @Length(2, 50)
  name: string;
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @Length(5, 100)
  @ApiProperty({ required: false })
  @IsOptional()
  bio?: string;

  @IsNotEmpty()
  @Transform(({ value }) => +value)
  @IsNumber()
  @IsInt()
  @ApiProperty({ type: "string", default: 1 })
  industryId: number;

  @ApiProperty({ type: "string", format: "binary", required: false })
  photo: any;
}
