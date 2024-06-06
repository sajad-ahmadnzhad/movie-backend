import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";

export class DeleteAccountDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;
}
