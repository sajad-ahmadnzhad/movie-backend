import { UseGuards, applyDecorators } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
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
import {
  GetAllGenresSchema,
  GetOneGenreSchema,
} from "../swagger/schemas/genre.schema";
import {
  BadRequestBodySchema,
  BadRequestParamSchema,
  ConflictSchema,
  ForbiddenSchema,
  JwtExpiredSchema,
  SuccessSchema,
  NotFoundSchema,
  TooManyRequests,
} from "../swagger/schemas/public.schema";
import { Roles } from "../enums/roles.enum";
import { RoleGuard } from "../guards/auth.guard";
import { JwtGuard } from "../guards/jwt.guard";
import { Role } from "./role.decorator";

//* Create Genre decorator
export const CreateGenreDecorator = applyDecorators(
  Role(Roles.ADMIN, Roles.SUPER_ADMIN),
  UseGuards(JwtGuard, RoleGuard),
  ApiCookieAuth(),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiOperation({ summary: "create new genre" }),
  ApiConflictResponse({
    description: "Already exists genre",
    schema: ConflictSchema,
  }),
  ApiOkResponse({
    description: "Created genre success",
    schema: SuccessSchema,
  }),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
  ApiBadRequestResponse({
    description: "Invalid body",
    schema: BadRequestBodySchema,
  }),
  ApiForbiddenResponse({
    description: "Forbidden resource",
    schema: ForbiddenSchema,
  })
);

//* Update Genre decorator
export const UpdateGenreDecorator = applyDecorators(
  Role(Roles.ADMIN, Roles.SUPER_ADMIN),
  UseGuards(JwtGuard, RoleGuard),
  ApiCookieAuth(),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiNotFoundResponse({
    description: "Genre not found",
    schema: NotFoundSchema,
  }),
  ApiForbiddenResponse({
    description: "Cannot update genre | Forbidden resource",
    schema: ForbiddenSchema,
  }),
  ApiOkResponse({
    description: "Updated genre success",
    schema: SuccessSchema,
  }),
  ApiConflictResponse({
    description: "Already exists Genre | Only super admin can update genre",
    schema: ConflictSchema,
  }),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
  ApiParam({ name: "id", description: "The id of the genre", type: "number" }),
  ApiBadRequestResponse({
    description: "Body validation error",
    schema: BadRequestBodySchema,
  }),
  ApiOperation({ summary: "update genre" })
);

//* Remove genre decorator
export const RemoveGenreDecorator = applyDecorators(
  Role(Roles.ADMIN, Roles.SUPER_ADMIN),
  UseGuards(JwtGuard, RoleGuard),
  ApiCookieAuth(),
  ApiNotFoundResponse({
    description: "Genre not found",
    schema: NotFoundSchema,
  }),
  ApiForbiddenResponse({
    description: "Cannot Remove genre | Forbidden resource",
    schema: ForbiddenSchema,
  }),
  ApiParam({ name: "id", description: "The id of the genre", type: "number" }),
  ApiBadRequestResponse({
    description: "Param validation error",
    schema: BadRequestParamSchema,
  }),
  ApiOkResponse({
    description: "Remove genre success",
    schema: SuccessSchema,
  }),
  ApiConflictResponse({
    description: "Only super admin can update genre",
    schema: ConflictSchema,
  }),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiOperation({ summary: "remove genre" })
);

//* Get one genre decorator
export const GetOneGenreDecorator = applyDecorators(
  ApiOperation({ summary: "get one genre by id" }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiNotFoundResponse({ schema: NotFoundSchema }),
  ApiBadRequestResponse({
    description: "Invalid id",
    schema: BadRequestParamSchema,
  }),
  ApiParam({ name: "id", description: "The id of the genre", type: "number" }),
  ApiOkResponse({ schema: GetOneGenreSchema })
);

//* Get all genres
export const GetAllGenresDecorator = applyDecorators(
  ApiOperation({ summary: "get all genres" }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiQuery({
    name: "page",
    type: "number",
    required: false,
    description: "The page of the genres",
    example: 1,
  }),
  ApiQuery({
    name: "limit",
    type: "number",
    required: false,
    description: "The count of the genre",
    example: 10,
  }),
  ApiOkResponse({ schema: GetAllGenresSchema })
);

//* Search Genres decorator
export const SearchGenresDecorator = applyDecorators(
  ApiOperation({ summary: "search in genres" }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiBadRequestResponse({
    description: "Required genre query",
    schema: BadRequestParamSchema,
  }),
  ApiQuery({
    name: "page",
    type: "number",
    required: false,
    description: "The page of the genres",
    example: 1,
  }),
  ApiQuery({
    name: "limit",
    type: "number",
    required: false,
    description: "The count of the genre",
    example: 10,
  }),
  ApiQuery({
    name: "genre",
    type: "string",
    description: "the name of the genre",
  }),
  ApiOkResponse({ schema: GetAllGenresSchema })
);
