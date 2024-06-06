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
} from "@nestjs/swagger";
import { memoryStorage } from "multer";
import { AuthGuard } from "../../modules/auth/guards/Auth.guard";
import { IsAdminGuard } from "../../modules/auth/guards/isAdmin.guard";
import { IsSuperAdminGuard } from "../../modules/auth/guards/isSuperAdmin.guard";
import { fileFilter } from "../utils/upload-file.util";

//* Get me decorator
export const GetMeDecorator = applyDecorators(
  UseGuards(AuthGuard),
  ApiInternalServerErrorResponse({ description: "Jwt expired" }),
  ApiOperation({ summary: "get my account" }),
  ApiOkResponse({ description: "get account", type: Object })
);

//* Get all users decorator
export const GetAllUsersDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiOkResponse({ description: "Return all users for admins", type: Object }),
  ApiInternalServerErrorResponse({ description: "Jwt expired" }),
  ApiForbiddenResponse({ description: "Forbidden resource" }),
  ApiOperation({ summary: "get all users" }),
  ApiQuery({ name: "page", type: Number, required: false }),
  ApiQuery({ name: "limit", type: Number, required: false })
);

//* Get one user decorator
export const GetOneUserDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiBadRequestResponse({ description: "This id is not from mongodb" }),
  ApiInternalServerErrorResponse({ description: "Jwt expired" }),
  ApiNotFoundResponse({ description: "User not found" }),
  ApiOkResponse({ description: "All users", type: Object }),
  ApiForbiddenResponse({ description: "Forbidden resource" }),
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
  ApiInternalServerErrorResponse({ description: "Jwt expired" }),
  ApiConsumes("multipart/form-data"),
  ApiOperation({ summary: "update current user" }),
  ApiOkResponse({ description: "Updated user success" }),
  ApiConflictResponse({
    description: "already registered with username or email",
  })
);

//* Remove user decorator
export const RemoveUserDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiNotFoundResponse({ description: "User not found" }),
  ApiBadRequestResponse({ description: "Cannot remove admin" }),
  ApiInternalServerErrorResponse({ description: "Jwt expired" }),
  ApiOkResponse({ description: "Removed user success" }),
  ApiOperation({ summary: "remove user" })
);

//* Change role user decorator
export const ChangeRoleUserDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard, IsSuperAdminGuard),
  ApiNotFoundResponse({ description: "User not found" }),
  ApiInternalServerErrorResponse({ description: "Jwt expired" }),
  ApiBadRequestResponse({ description: "Cannot change role super admin" }),
  ApiOkResponse({ description: "Changed role success" }),
  ApiOperation({ summary: "change role to admin or user" })
);

//* Search user decorator
export const SearchUserDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiOperation({ summary: "search in users list" }),
  ApiInternalServerErrorResponse({ description: "Jwt expired" }),
  ApiBadRequestResponse({ description: "User query is required" }),
  ApiOkResponse({ description: "Get matched users", type: Object })
);

//* Delete account user decorator
export const DeleteAccountUserDecorator = applyDecorators(
  UseGuards(AuthGuard),
  ApiBadRequestResponse({
    description: "Invalid Password | cannot delete account super admin",
  }),
  ApiInternalServerErrorResponse({ description: "Jwt expired" }),
  ApiBadRequestResponse({
    description: "Transfer Ownership For Delete Account | Invalid password",
  }),
  ApiOkResponse({ description: "Deleted account success" }),
  ApiOperation({ summary: "delete account user" })
);

//* Change super admin decorator
export const ChangeSuperAdminDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard, IsSuperAdminGuard),
  ApiParam({
    name: "userId",
    description: "ID of the person who becomes the owner",
  }),
  ApiInternalServerErrorResponse({ description: "Jwt expired" }),
  ApiNotFoundResponse({ description: "User not found" }),
  ApiBadRequestResponse({
    description: "Entered id is super admin | Invalid password",
  }),
  ApiOkResponse({ description: "Changed super admin success" }),
  ApiOperation({ summary: "possession transition" })
);

//* Ban User Decorator
export const BanUserDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiForbiddenResponse({ description: "Cannot ban admin or super admin" }),
  ApiNotFoundResponse({ description: "User not found" }),
  ApiConflictResponse({ description: "Already banned user" }),
  ApiOkResponse({ description: "Banned user success" }),
  ApiInternalServerErrorResponse({ description: "Jwt expired" }),
  ApiOperation({ summary: "ban a user" })
);

//* Unban User Decorator
export const UnbanUserDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiNotFoundResponse({ description: "User not found" }),
  ApiOkResponse({ description: "Unbanned user success" }),
  ApiInternalServerErrorResponse({ description: "Jwt expired" }),
  ApiOperation({ summary: "unban a user" })
);

//* Get all ban user Decorator
export const GetAllBanUserDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiInternalServerErrorResponse({ description: "Jwt expired" }),
  ApiOperation({ summary: "get all ban users" }),
  ApiOkResponse({type: [Object]})
);
