import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  MinLength,
  Matches,
  IsEmail,
  IsOptional,
} from "class-validator";
import { Transform } from "class-transformer";

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @MaxLength(40)
  @MinLength(2)
  @ApiProperty({
    type: "string",
    maxLength: 40,
    minLength: 2,
    required: false,
  })
  name: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9_]+$/, { message: "Invalid username" })
  @MaxLength(40)
  @MinLength(2)
  @ApiProperty({
    type: "string",
    maxLength: 40,
    minLength: 2,
    required: false,
  })
  username: string;

  @IsOptional()
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ type: "string", required: false })
  email: string;

  @IsOptional()
  @ApiProperty({ type: "string", format: "binary", required: false })
  avatar: any;
}
