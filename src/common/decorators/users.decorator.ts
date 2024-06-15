import { UseGuards, UseInterceptors, applyDecorators } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTooManyRequestsResponse,
} from "@nestjs/swagger";
import { memoryStorage } from "multer";
import { AuthGuard } from "../../modules/auth/guards/Auth.guard";
import { IsAdminGuard } from "../../modules/auth/guards/isAdmin.guard";
import { IsSuperAdminGuard } from "../../modules/auth/guards/isSuperAdmin.guard";
import { fileFilter } from "../utils/upload-file.util";
import {
  GetAllBannedUsers,
  GetAllUsersSchema,
  GetOneUserSchema,
} from "../swagger/schemas/user.schema";
import {
  BadRequestParamSchema,
  ForbiddenSchema,
  JwtExpiredSchema,
  NotFoundSchema,
  ConflictSchema,
  SuccessSchema,
  BadRequestBodySchema,
  TooManyRequests,
} from "../swagger/schemas/public.schema";

//* Get me decorator
export const GetMeDecorator = applyDecorators(
  UseGuards(AuthGuard),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
  ApiOperation({ summary: "get my account" }),
  ApiOkResponse({ description: "get account", schema: GetOneUserSchema }),
  ApiForbiddenResponse({
    description: "This path is protected !!",
    schema: ForbiddenSchema,
  }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  })
);

//* Get all users decorator
export const GetAllUsersDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiOkResponse({
    description: "Return all users for admins",
    schema: GetAllUsersSchema,
  }),
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
  ApiOperation({ summary: "get all users" }),
  ApiQuery({
    name: "page",
    type: Number,
    required: false,
    description: "The page of the users",
  }),
  ApiQuery({
    name: "limit",
    type: Number,
    required: false,
    description: "The count of the user",
  })
);

//* Get one user decorator
export const GetOneUserDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiBadRequestResponse({
    description: "This id is not from mongodb",
    schema: BadRequestParamSchema,
  }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiParam({ name: "userId", description: "The id of the user" }),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
  ApiNotFoundResponse({
    description: "User not found",
    schema: NotFoundSchema,
  }),
  ApiOkResponse({ schema: GetOneUserSchema }),
  ApiForbiddenResponse({
    description: "Forbidden resource",
    schema: ForbiddenSchema,
  }),
  ApiOperation({ summary: "get one user" })
);

//* Update user decorator
export const UpdateUserDecorator = applyDecorators(
  UseGuards(AuthGuard),
  UseInterceptors(
    FileInterceptor("avatar", {
      fileFilter,
      storage: memoryStorage(),
      limits: { fileSize: 2048 * 1024, fields: 1, files: 1 },
    })
  ),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
  ApiConsumes("multipart/form-data"),
  ApiOperation({ summary: "update current user" }),
  ApiOkResponse({ description: "Updated user success", schema: SuccessSchema }),
  ApiConflictResponse({
    description: "already registered with username or email",
    schema: ConflictSchema,
  }),
  ApiBadRequestResponse({
    description: "User validation error",
    schema: BadRequestBodySchema,
  })
);

//* Remove user decorator
export const RemoveUserDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiNotFoundResponse({
    description: "User not found",
    schema: NotFoundSchema,
  }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiBadRequestResponse({
    description: "Cannot remove admin",
    schema: BadRequestParamSchema,
  }),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
  ApiParam({ name: "userId", description: "The id of the user" }),
  ApiBadRequestResponse({
    description: "This id is not from mongodb",
    schema: BadRequestParamSchema,
  }),
  ApiOkResponse({ description: "Removed user success", schema: SuccessSchema }),
  ApiOperation({ summary: "remove user" }),
  ApiForbiddenResponse({
    description: "Forbidden resource",
    schema: ForbiddenSchema,
  })
);

//* Change role user decorator
export const ChangeRoleUserDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard, IsSuperAdminGuard),
  ApiNotFoundResponse({
    description: "User not found",
    schema: NotFoundSchema,
  }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
  ApiBadRequestResponse({
    description: "Cannot change role super admin",
    schema: BadRequestParamSchema,
  }),
  ApiOkResponse({ description: "Changed role success", schema: SuccessSchema }),
  ApiParam({ name: "userId", description: "The id of the user" }),
  ApiOperation({ summary: "change role to admin or user" })
);

//* Search user decorator
export const SearchUserDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiOperation({ summary: "search in users list" }),
  ApiQuery({ name: "user", description: "The query of the user" }),
  ApiQuery({
    name: "page",
    type: Number,
    required: false,
    description: "The page of the users",
  }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiQuery({
    name: "limit",
    type: Number,
    required: false,
    description: "The count of the user",
  }),
  ApiForbiddenResponse({
    schema: ForbiddenSchema,
    description: "This path is protected !!",
  }),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
  ApiBadRequestResponse({
    description: "User query is required",
    schema: BadRequestParamSchema,
  }),
  ApiOkResponse({ description: "Get matched users", schema: GetAllUsersSchema })
);

//* Delete account user decorator
export const DeleteAccountUserDecorator = applyDecorators(
  UseGuards(AuthGuard),
  ApiBadRequestResponse({
    description: "Invalid Password | cannot delete account super admin",
    schema: BadRequestParamSchema,
  }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
  ApiOkResponse({
    description: "Deleted account success",
    schema: SuccessSchema,
  }),
  ApiForbiddenResponse({
    description: "This path is protected !!",
    schema: ForbiddenSchema,
  }),
  ApiOperation({ summary: "delete account user" })
);

//* Change super admin decorator
export const ChangeSuperAdminDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard, IsSuperAdminGuard),
  ApiParam({
    name: "userId",
    description: "ID of the person who becomes the owner",
  }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
  ApiNotFoundResponse({
    description: "User not found",
    schema: NotFoundSchema,
  }),
  ApiBadRequestResponse({
    description: "Entered id is super admin | Invalid password",
    schema: BadRequestParamSchema,
  }),
  ApiOkResponse({
    description: "Changed super admin success",
    schema: SuccessSchema,
  }),
  ApiForbiddenResponse({
    description: "This path is protected !!",
    schema: ForbiddenSchema,
  }),
  ApiOperation({ summary: "possession transition" })
);

//* Ban User Decorator
export const BanUserDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiForbiddenResponse({
    description: "Cannot ban admin or super admin",
    schema: ForbiddenSchema,
  }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiNotFoundResponse({
    description: "User not found",
    schema: NotFoundSchema,
  }),
  ApiConflictResponse({
    description: "Already banned user",
    schema: ConflictSchema,
  }),
  ApiBadRequestResponse({
    description: "Ban Validation error",
    schema: BadRequestBodySchema,
  }),
  ApiOkResponse({ description: "Banned user success", schema: SuccessSchema }),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
  ApiOperation({ summary: "ban a user" })
);

//* Unban User Decorator
export const UnbanUserDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiNotFoundResponse({
    description: "User not found",
    schema: NotFoundSchema,
  }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiOkResponse({
    description: "Unbanned user success",
    schema: SuccessSchema,
  }),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
  ApiForbiddenResponse({
    description: "This path is protected !!",
    schema: ForbiddenSchema,
  }),
  ApiParam({ name: "id", description: "The id of the banned user" }),
  ApiBadRequestResponse({
    description: "This id is not from mongodb",
    schema: BadRequestBodySchema,
  }),
  ApiOperation({ summary: "unban a user" })
);

//* Get all ban user Decorator
export const GetAllBanUserDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiQuery({
    name: "page",
    type: Number,
    required: false,
    description: "The page of the users",
  }),
  ApiQuery({
    name: "limit",
    type: Number,
    required: false,
    description: "The count of the user",
  }),
  ApiOperation({ summary: "get all ban users" }),
  ApiOkResponse({ schema: GetAllBannedUsers })
);
