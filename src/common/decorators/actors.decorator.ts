import { UseGuards, UseInterceptors, applyDecorators } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
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
  ApiQuery,
} from "@nestjs/swagger";
import { AuthGuard } from "../../modules/auth/guards/Auth.guard";
import { IsAdminGuard } from "../../modules/auth/guards/isAdmin.guard";
import { fileFilter } from "../utils/upload-file.util";
import { memoryStorage } from "multer";
import { PublicMessages } from "../enum/public.messages";

//* Create actor decorator
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

//* Get all actors decorator
export const GetAllActorsDecorator = applyDecorators(
  ApiOperation({ summary: "get all actors" }),
  ApiQuery({ name: "page", type: Number, required: false }),
  ApiQuery({ name: "limit", type: Number, required: false }),
  ApiOkResponse({ type: [Object] })
);

//* Get one actor decorator
export const GetOneActorDecorator = applyDecorators(
  ApiOperation({ summary: "get one actor by id" }),
  ApiNotFoundResponse({ description: "Actor not found" }),
  ApiBadRequestResponse({ description: PublicMessages.InvalidObjectId }),
  ApiOkResponse({ type: Object })
);
