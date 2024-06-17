import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from "class-validator";
import { ConfirmPassword } from "src/common/utils/custom-decorators";

export class SignupUserDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @MaxLength(40)
  @MinLength(2)
  @ApiProperty({
    type: "string",
    maxLength: 40,
    minLength: 2,
  })
  name: string;

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
  })
  username: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsString()
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @MaxLength(30)
  @MinLength(8)
  @ApiProperty({
    type: "string",
    maxLength: 30,
    minLength: 8,
  })
  password: string;

  @IsNotEmpty()
  @ApiProperty()
  @ConfirmPassword()
  confirmPassword: string;
}
