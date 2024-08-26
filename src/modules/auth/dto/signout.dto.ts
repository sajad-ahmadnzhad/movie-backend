import { ApiProperty } from "@nestjs/swagger";
import { IsJWT, IsNotEmpty, IsString } from "class-validator";

export class SignoutDto {
  @IsNotEmpty()
  @IsString()
  @IsJWT()
  @ApiProperty({ type: "string", required: true})
  refreshToken: string;
}
