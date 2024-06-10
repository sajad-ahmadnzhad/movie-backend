import { UseGuards, applyDecorators } from "@nestjs/common";
import {
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from "@nestjs/swagger";
import { AuthGuard } from "../../modules/auth/guards/Auth.guard";

//* Create comment decorator
export const CreateCommentDecorator = applyDecorators(
  UseGuards(AuthGuard),
  ApiCookieAuth(),
  ApiNotFoundResponse({ description: "Movie not Found" }),
  ApiForbiddenResponse({ description: "Forbidden resource" }),
  ApiInternalServerErrorResponse({ description: "Jwt expired" }),
  ApiOperation({ summary: "create a comment" }),
  ApiOkResponse({ description: "Created comment success" })
);
