import { UseGuards, applyDecorators } from "@nestjs/common";
import {
  ApiConflictResponse,
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

  ApiForbiddenResponse({ description: "Forbidden resource" }),
  ApiInternalServerErrorResponse({ description: "Jwt expired" }),
  ApiOperation({ summary: "create a comment" }),
  ApiOkResponse({ description: "Created comment success" })
);

//* Reply comment decorator
export const ReplyCommentDecorator = applyDecorators(
  UseGuards(AuthGuard),
  ApiCookieAuth(),
  ApiNotFoundResponse({ description: "Comment not Found" }),
  ApiConflictResponse({ description: "Not Accepted comment" }),
  ApiForbiddenResponse({ description: "Forbidden resource" }),
  ApiInternalServerErrorResponse({ description: "Jwt expired" }),
  ApiOkResponse({ description: "Replied comment success" }),
  ApiOperation({ summary: "reply to comment" })
);
