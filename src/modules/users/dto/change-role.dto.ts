import { ApiProperty } from "@nestjs/swagger";
import { Roles } from "../../../common/enums/roles.enum";
import { IsEnum, IsNotEmpty } from "class-validator";

export class ChangeRoleDto {
  @IsNotEmpty()
  @IsEnum(Roles)
  @ApiProperty({
    type: Roles,
    enum: Roles,
    required: true,
    default: Roles.ADMIN,
  })
  role: Roles;
}
