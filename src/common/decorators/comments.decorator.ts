import { UseGuards, applyDecorators } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiConsumes,
  ApiCookieAuth,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTooManyRequestsResponse,
} from "@nestjs/swagger";
import { JwtGuard } from "../guards/jwt.guard";
import { Roles } from "../enums/roles.enum";
import { RoleGuard } from "../guards/auth.guard";
import { Role } from "./role.decorator";
import {
  BadRequestBodySchema,
  BadRequestParamSchema,
  ConflictSchema,
  ForbiddenSchema,
  JwtExpiredSchema,
  NotFoundSchema,
  SuccessSchema,
  TooManyRequests,
} from "../swagger/schemas/public.schema";
import { CommentSchema } from "../swagger/schemas/comment.schema";

//* Create comment decorator
export const CreateCommentDecorator = applyDecorators(
  UseGuards(JwtGuard),
  ApiCookieAuth(),
  ApiForbiddenResponse({
    description: "Forbidden resource",
    schema: ForbiddenSchema,
  }),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
  ApiOperation({ summary: "create a comment" }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiOkResponse({
    description: "Created comment success",
    schema: SuccessSchema,
  }),
  ApiConsumes("application/x-www-form-urlencoded", "application/json"),
  ApiBadRequestResponse({
    description: "Validation error",
    schema: BadRequestBodySchema,
  })
);

//* Reply comment decorator
export const ReplyCommentDecorator = applyDecorators(
  UseGuards(JwtGuard),
  ApiCookieAuth(),
  ApiNotFoundResponse({
    description: "Comment not Found",
    schema: NotFoundSchema,
  }),
  ApiConflictResponse({
    description: "Not Accepted comment",
    schema: ConflictSchema,
  }),
  ApiForbiddenResponse({
    description: "Forbidden resource",
    schema: ForbiddenSchema,
  }),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
  ApiOkResponse({
    description: "Replied comment success",
    schema: SuccessSchema,
  }),
  ApiConsumes("application/x-www-form-urlencoded", "application/json"),
  ApiParam({ name: "id", description: "Comment id", type: "number" }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiBadRequestResponse({
    description: "Validation error",
    schema: BadRequestBodySchema,
  }),
  ApiOperation({ summary: "reply to comment" })
);

//* Accept comment decorator
export const AcceptCommentDecorator = applyDecorators(
  Role(Roles.ADMIN, Roles.SUPER_ADMIN),
  ApiCookieAuth(),
  ApiBadRequestResponse({
    description: "Validation error",
    schema: BadRequestParamSchema,
  }),
  ApiNotFoundResponse({
    description: "Comment not Found",
    schema: NotFoundSchema,
  }),
  ApiForbiddenResponse({
    description: "Forbidden resource | Cannot accept comment",
    schema: ForbiddenSchema,
  }),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
  ApiConflictResponse({
    description: "Already accepted comment",
    schema: ConflictSchema,
  }),
  ApiOkResponse({
    description: "Accepted comment success",
    schema: SuccessSchema,
  }),
  ApiParam({ name: "id", description: "Comment id", type: "number" }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiOperation({ summary: "accept a comment" })
);

//* Reject comment decorator
export const RejectCommentDecorator = applyDecorators(
  UseGuards(JwtGuard, RoleGuard),
  Role(Roles.SUPER_ADMIN, Roles.ADMIN),
  ApiCookieAuth(),
  ApiNotFoundResponse({
    description: "Comment not Found",
    schema: NotFoundSchema,
  }),
  ApiForbiddenResponse({
    description: "Forbidden resource | Cannot reject comment",
    schema: ForbiddenSchema,
  }),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
  ApiConflictResponse({
    description: "Already Rejected comment",
    schema: ConflictSchema,
  }),
  ApiOkResponse({
    description: "Rejected comment success",
    schema: SuccessSchema,
  }),
  ApiBadRequestResponse({
    description: "Validation error",
    schema: BadRequestParamSchema,
  }),
  ApiParam({ name: "id", description: "Comment id", type: "number" }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiOperation({ summary: "reject a comment" })
);

//* Update comment decorator
export const UpdateCommentDecorator = applyDecorators(
  UseGuards(JwtGuard),
  ApiCookieAuth(),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
  ApiParam({ name: "id", description: "Comment id", type: "number" }),
  ApiNotFoundResponse({
    description: "Comment not Found | Movie not found",
    schema: NotFoundSchema,
  }),
  ApiOperation({ summary: "update a comment" }),
  ApiForbiddenResponse({
    description: "Forbidden resource",
    schema: ForbiddenSchema,
  }),
  ApiBadRequestResponse({
    description: "Validation error",
    schema: BadRequestBodySchema,
  }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiConsumes("application/x-www-form-urlencoded", "application/json"),
  ApiOkResponse({ description: "Updated comment success" })
);

//* Get unaccepted comment decorator
export const GetUnacceptedCommentDecorator = applyDecorators(
  Role(Roles.ADMIN, Roles.SUPER_ADMIN),
  UseGuards(JwtGuard, RoleGuard),
  ApiOkResponse({ schema: CommentSchema }),
  ApiQuery({
    name: "page",
    required: false,
    type: "number",
    description: "The page of the comments",
    example: 1,
  }),
  ApiQuery({
    name: "limit",
    required: false,
    type: "number",
    description: "The count of the comments",
    example: 10,
  }),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
  ApiForbiddenResponse({
    description: "Forbidden resource",
    schema: ForbiddenSchema,
  }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiOperation({ summary: "get unaccepted comments" })
);

//* Get movie comments decorator
export const GetMovieCommentsDecorator = applyDecorators(
  ApiOkResponse({ schema: CommentSchema }),
  ApiQuery({
    name: "page",
    required: false,
    type: "number",
    description: "The page of the comments",
    example: 1,
  }),
  ApiQuery({
    name: "limit",
    required: false,
    type: "number",
    description: "The count of the comments",
    example: 10,
  }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiParam({ name: "id", description: "The id of the movie", type: "number" }),
  ApiBadRequestResponse({
    description: "Validation error",
    schema: BadRequestParamSchema,
  }),
  ApiOperation({ summary: "get comments" })
);

//* Remove comment decorator
export const RemoveCommentDecorator = applyDecorators(
  UseGuards(JwtGuard),
  ApiCookieAuth(),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiParam({
    name: "id",
    description: "The id of the comment",
    type: "number",
  }),
  ApiOperation({ summary: "remove a comment" }),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
  ApiForbiddenResponse({
    description: "Forbidden resource",
    schema: ForbiddenSchema,
  }),
  ApiNotFoundResponse({
    description: "Comment not Found",
    schema: NotFoundSchema,
  }),
  ApiOkResponse({
    description: "Removed comment success",
    schema: SuccessSchema,
  }),
  ApiBadRequestResponse({
    description: "Validation error",
    schema: BadRequestParamSchema,
  })
);

//* Mark as reviewed comment decorator
export const MarkAsReviewedDecorator = applyDecorators(
  UseGuards(JwtGuard, RoleGuard),
  Role(Roles.ADMIN, Roles.SUPER_ADMIN),
  ApiCookieAuth(),
  ApiNotFoundResponse({
    description: "Comment not found",
    schema: NotFoundSchema,
  }),
  ApiConflictResponse({
    description: "Already reviewed comment",
    schema: ConflictSchema,
  }),
  ApiParam({
    name: "id",
    description: "The id of the comment",
    type: "number",
  }),
  ApiOperation({ summary: "review a comment" }),
  ApiOkResponse({ description: "Reviewed success", schema: SuccessSchema }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
  ApiForbiddenResponse({
    description: "Forbidden resource",
    schema: ForbiddenSchema,
  }),
  ApiBadRequestResponse({
    description: "Validation error",
    schema: BadRequestParamSchema,
  })
);
