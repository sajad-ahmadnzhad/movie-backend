import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class BanUserDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;
}
