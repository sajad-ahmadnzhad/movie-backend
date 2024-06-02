import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class DeleteAccountDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  password: string;
}
