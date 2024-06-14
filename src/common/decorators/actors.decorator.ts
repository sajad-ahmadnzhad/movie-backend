import { UseGuards, UseInterceptors, applyDecorators } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiConsumes,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTooManyRequestsResponse,
} from "@nestjs/swagger";
import { AuthGuard } from "../../modules/auth/guards/Auth.guard";
import { IsAdminGuard } from "../../modules/auth/guards/isAdmin.guard";
import { fileFilter } from "../utils/upload-file.util";
import { memoryStorage } from "multer";
import { PublicMessages } from "../enum/public.messages";
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
import {
  GetAllActorsSchema,
  GetOneActorSchema,
} from "../swagger/schemas/actor.schema";

//* Create actor decorator
export const CreateActorDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
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
  ApiConflictResponse({
    description: "Already exists actor",
    schema: ConflictSchema,
  }),
  ApiBadRequestResponse({
    description: "Actor validation error",
    schema: BadRequestBodySchema,
  }),
  ApiCreatedResponse({
    description: "Created actor success",
    schema: SuccessSchema,
  }),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
  ApiForbiddenResponse({
    description: "Forbidden resource",
    schema: ForbiddenSchema,
  }),
  ApiNotFoundResponse({
    description: "Industry not found",
    schema: NotFoundSchema,
  })
);

//* Get all actors decorator
export const GetAllActorsDecorator = applyDecorators(
  ApiOperation({ summary: "get all actors" }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiQuery({
    name: "page",
    type: Number,
    required: false,
    description: "The page of the actors",
  }),
  ApiQuery({
    name: "limit",
    type: Number,
    required: false,
    description: "The count of the actors",
  }),
  ApiOkResponse({ schema: GetAllActorsSchema })
);

//* Get one actor decorator
export const GetOneActorDecorator = applyDecorators(
  ApiOperation({ summary: "get one actor by id" }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiNotFoundResponse({
    description: "Actor not found",
    schema: NotFoundSchema,
  }),
  ApiBadRequestResponse({
    description: PublicMessages.InvalidObjectId,
    schema: BadRequestParamSchema,
  }),
  ApiParam({ name: "id", description: "The id of the actor" }),
  ApiOkResponse({ schema: GetOneActorSchema })
);

//* Get actors by country decorator
export const GetActorsByCountry = applyDecorators(
  ApiOperation({ summary: "get actors by country" }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiNotFoundResponse({
    description: "Country not found",
    schema: NotFoundSchema,
  }),
  ApiBadRequestResponse({
    description: PublicMessages.InvalidObjectId,
    schema: BadRequestParamSchema,
  }),
  ApiParam({ name: "id", description: "The id of the country" }),
  ApiOkResponse({ schema: GetAllActorsSchema })
);

//* Get actors by industry decorator
export const GetActorsByIndustry = applyDecorators(
  ApiOperation({ summary: "get actors by industry" }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiParam({ name: "id", description: "The id of the industry" }),
  ApiNotFoundResponse({
    description: "Industry not found",
    schema: NotFoundSchema,
  }),
  ApiBadRequestResponse({
    description: PublicMessages.InvalidObjectId,
    schema: BadRequestParamSchema,
  }),
  ApiOkResponse({ schema: GetAllActorsSchema })
);

//* Search Actors decorator
export const SearchActorsDecorator = applyDecorators(
  ApiOperation({ summary: "search in actors" }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiBadRequestResponse({
    description: "Required actor query",
    schema: BadRequestParamSchema,
  }),
  ApiQuery({
    name: "actor",
    type: String,
    description: "The name of the actor",
  }),
  ApiOkResponse({ schema: GetAllActorsSchema })
);

//* Update actor decorator
export const UpdateActorDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiCookieAuth(),
  UseInterceptors(
    FileInterceptor("photo", {
      fileFilter,
      storage: memoryStorage(),
      limits: { fileSize: 2048 * 1024, files: 1 },
    })
  ),
  ApiConsumes("multipart/form-data"),
  ApiNotFoundResponse({
    description: "Actor not found | Industry not found",
    schema: NotFoundSchema,
  }),
  ApiForbiddenResponse({
    description: "Cannot update actor | Forbidden resource",
    schema: ForbiddenSchema,
  }),
  ApiBadRequestResponse({
    description: "Actor validation error",
    schema: BadRequestParamSchema,
  }),
  ApiOkResponse({
    description: "Updated actor success",
    schema: SuccessSchema,
  }),
  ApiConflictResponse({
    description: "Already exists actor",
    schema: ConflictSchema,
  }),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
  ApiOperation({ summary: "update actor" })
);

//* Remove actor decorator
export const RemoveActorDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiCookieAuth(),
  ApiNotFoundResponse({
    description: "actor not found",
    schema: NotFoundSchema,
  }),
  ApiForbiddenResponse({
    description: "Cannot remove actor | Forbidden resource",
    schema: ForbiddenSchema,
  }),
  ApiOkResponse({ description: "Remove actor success", schema: SuccessSchema }),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
  ApiParam({ name: "id", description: "The id of the actor" }),
  ApiOperation({ summary: "remove actor" })
);
