import { UseGuards, applyDecorators } from "@nestjs/common";
import { AuthGuard } from "../../modules/auth/guards/Auth.guard";
import { IsAdminGuard } from "../../modules/auth/guards/isAdmin.guard";

//* Create industry decorator 
export const CreateIndustryDecorator = applyDecorators(
    UseGuards(AuthGuard , IsAdminGuard)
)