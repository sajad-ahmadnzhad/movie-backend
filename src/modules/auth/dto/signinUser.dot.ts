import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class SigninUserDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: "string",
    required: true,
  })
  identifier: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: 'string',
    required: true
  })
  password: string;
}
