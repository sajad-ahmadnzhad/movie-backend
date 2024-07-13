import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class ResetPasswordDto {
  @Transform(({ value }) => value?.trim())
  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  @MinLength(8)
  @ApiProperty({
    type: "string",
    maxLength: 40,
    minLength: 8,
    required: true
  })
  password: string;
}
