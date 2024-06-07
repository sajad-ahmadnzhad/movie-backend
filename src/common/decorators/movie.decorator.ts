import { UseGuards, applyDecorators } from "@nestjs/common";
import { ApiConsumes, ApiOperation } from "@nestjs/swagger";
import { AuthGuard } from "src/modules/auth/guards/Auth.guard";
import { IsAdminGuard } from "src/modules/auth/guards/isAdmin.guard";

//* Create movie decorator
export const CreateMovieDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiConsumes("multipart/form-data")
);
