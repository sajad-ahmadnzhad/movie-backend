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
import { JwtGuard } from "../guards/jwt.guard";
import { Roles } from "../enums/roles.enum";
import { RoleGuard } from "../guards/auth.guard";
import { Role } from "./role.decorator";

//* Create comment decorator
export const CreateCommentDecorator = applyDecorators(
  UseGuards(JwtGuard),
  ApiForbiddenResponse({ description: "Forbidden resource" }),
  ApiInternalServerErrorResponse({ description: "Jwt expired" }),
  ApiOperation({ summary: "create a comment" }),
  ApiOkResponse({ description: "Created comment success" })
);

//* Reply comment decorator
export const ReplyCommentDecorator = applyDecorators(
  UseGuards(JwtGuard),
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
  Role(Roles.ADMIN, Roles.SUPER_ADMIN),
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
  UseGuards(JwtGuard, RoleGuard),
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

//* Update comment decorator
export const UpdateCommentDecorator = applyDecorators(
  UseGuards(JwtGuard),
  ApiInternalServerErrorResponse({ description: "Jwt expired" }),
  ApiParam({ name: "id", description: "Comment id" }),
  ApiNotFoundResponse({ description: "Comment not Found | Movie not found" }),
  ApiOperation({ summary: "update a comment" }),
  ApiForbiddenResponse({ description: "Forbidden resource" }),
  ApiOkResponse({ description: "Updated comment success" })
);
