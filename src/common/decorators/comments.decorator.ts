import { UseGuards, applyDecorators } from "@nestjs/common";
import {
  ApiConflictResponse,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
} from "@nestjs/swagger";
import { AuthGuard } from "../../modules/auth/guards/Auth.guard";
import { IsAdminGuard } from "../../modules/auth/guards/isAdmin.guard";

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
  ApiParam({ name: "id", description: "Comment id" }),
  ApiOperation({ summary: "reply to comment" })
);

//* Accept comment decorator
export const AcceptCommentDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiCookieAuth(),
  ApiNotFoundResponse({ description: "Comment not Found" }),
  ApiForbiddenResponse({
    description: "Forbidden resource | Cannot accept comment",
  }),
  ApiInternalServerErrorResponse({ description: "Jwt expired" }),
  ApiConflictResponse({ description: "Already accepted comment" }),
  ApiOkResponse({ description: "Accepted comment success" }),
  ApiParam({ name: "id", description: "Comment id" }),
  ApiOperation({ summary: "accept a comment" })
);

//* Reject comment decorator
export const RejectCommentDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiCookieAuth(),
  ApiNotFoundResponse({ description: "Comment not Found" }),
  ApiForbiddenResponse({
    description: "Forbidden resource | Cannot reject comment",
  }),
  ApiInternalServerErrorResponse({ description: "Jwt expired" }),
  ApiConflictResponse({ description: "Already Rejected comment" }),
  ApiOkResponse({ description: "Rejected comment success" }),
  ApiParam({ name: "id", description: "Comment id" }),
  ApiOperation({ summary: "reject a comment" })
);
