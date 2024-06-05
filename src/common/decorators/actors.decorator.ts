import { UseGuards, UseInterceptors, applyDecorators } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConflictResponse, ApiConsumes, ApiCookieAuth, ApiForbiddenResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation } from "@nestjs/swagger";
import { AuthGuard } from "../../modules/auth/guards/Auth.guard";
import { IsAdminGuard } from "../../modules/auth/guards/isAdmin.guard";
import { fileFilter } from '../utils/upload-file.util';
import { memoryStorage } from "multer";

export const CreateActorDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiCookieAuth(),
  ApiOperation({ summary: "create new actor" }),
  ApiConsumes("multipart/form-data"),
  UseInterceptors(
    FileInterceptor("photo", {
      fileFilter,
      storage: memoryStorage(),
      limits: { fileSize: 2048 * 1024, files: 1 },
    })
  ),
  ApiConflictResponse({ description: "Already exists actor" }),
  ApiOkResponse({ description: "Created actor success" }),
  ApiInternalServerErrorResponse({ description: "Jwt expired" }),
  ApiForbiddenResponse({ description: "Forbidden resource" }),
  ApiNotFoundResponse({ description: "Industry not found" })
);
