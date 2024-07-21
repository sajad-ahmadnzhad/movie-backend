import {
  HttpCode,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  applyDecorators,
} from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import {
  ApiBadRequestResponse,
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
import { memoryStorage } from "multer";
import { movieFileFilter } from "../utils/upload-file.util";
import {
  NotFoundSchema,
  TooManyRequests,
  BadRequestBodySchema,
  JwtExpiredSchema,
  ForbiddenSchema,
  SuccessSchema,
  BadRequestParamSchema,
} from "../swagger/schemas/public.schema";
import {
  BookmarkAndLikeHistorySchema,
  GetAllMoviesSchema,
  GetOneMovie,
} from "../swagger/schemas/movie.schema";
import { Roles } from "../enums/roles.enum";
import { RoleGuard } from "../guards/auth.guard";
import { JwtGuard } from "../guards/jwt.guard";
import { Role } from "./role.decorator";

//* Create movie decorator
export const CreateMovieDecorator = applyDecorators(
  Role(Roles.ADMIN, Roles.SUPER_ADMIN),
  UseGuards(JwtGuard, RoleGuard),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiCookieAuth(),
  ApiConsumes("multipart/form-data"),
  UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "poster", maxCount: 1 },
        { name: "video", maxCount: 1 },
      ],
      {
        fileFilter: movieFileFilter,
        limits: { fileSize: 30 * 1024 * 1024, files: 2 },
        storage: memoryStorage(),
      }
    )
  ),
  ApiNotFoundResponse({
    description: "industry | genre | actor not found",
    schema: NotFoundSchema,
  }),
  ApiBadRequestResponse({
    description: "Required poster and video",
    schema: BadRequestBodySchema,
  }),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
  ApiForbiddenResponse({
    description: "Forbidden resource",
    schema: ForbiddenSchema,
  }),
  ApiOperation({ summary: "create a movie" }),
  ApiCreatedResponse({
    description: "Created movie success",
    schema: SuccessSchema,
  })
);

//* Get all movies
export const GetAllMoviesDecorator = applyDecorators(
  ApiOperation({ summary: "get all movies" }),
  ApiQuery({
    name: "page",
    required: false,
    type: "number",
    description: "The page of the movies",
    example: 1,
  }),
  ApiQuery({
    name: "limit",
    required: false,
    type: "number",
    description: "The count of the movie",
    example: 10,
  }),
  ApiQuery({
    name: "release_year",
    required: false,
    description: "release year movie",
    type: "number",
    example: 2024,
  }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiQuery({
    name: "country",
    required: false,
    description: "the id of the country",
    type: "number",
    example: 1,
  }),
  ApiQuery({
    name: "actor",
    required: false,
    description: "the id of the actor",
    type: "number",
    example: 1,
  }),
  ApiQuery({
    name: "industry",
    required: false,
    description: "the id of the industry",
    type: "number",
    example: 1,
  }),
  ApiQuery({
    name: "genre",
    required: false,
    description: "the id of the genre",
    type: "number",
    example: 1,
  }),
  ApiOkResponse({ schema: GetAllMoviesSchema })
);

//* Get one movie decorator
export const GetOneMovieDecorator = applyDecorators(
  ApiOperation({ summary: "get one movie by id" }),
  ApiNotFoundResponse({
    description: "Movie not found",
    schema: NotFoundSchema,
  }),
  ApiBadRequestResponse({
    description: "Invalid id",
    schema: BadRequestParamSchema,
  }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiParam({
    name: "id",
    description: "The id of the movie",
    type: "number",
    example: 1,
  }),
  ApiOkResponse({ schema: GetOneMovie })
);

//* Search movies decorator
export const SearchMoviesDecorator = applyDecorators(
  ApiOperation({ summary: "search in movies" }),
  ApiBadRequestResponse({
    description: "Required movie query",
    schema: BadRequestParamSchema,
  }),
  ApiQuery({
    name: "movie",
    type: "string",
    description: "The query of the movie",
    example: "Tiger 3",
  }),
  ApiQuery({
    name: "page",
    type: "string",
    description: "The page of the movies",
    required: false,
    example: 1,
  }),
  ApiQuery({
    name: "limit",
    type: "string",
    description: "The count of the movies",
    required: false,
    example: 10,
  }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiOkResponse({ schema: GetAllMoviesSchema })
);

//* Remove movie decorator
export const RemoveMovieDecorator = applyDecorators(
  Role(Roles.ADMIN, Roles.SUPER_ADMIN),
  UseGuards(JwtGuard, RoleGuard),
  ApiCookieAuth(),
  ApiNotFoundResponse({
    description: "Movie not found",
    schema: NotFoundSchema,
  }),
  ApiBadRequestResponse({
    description: "Invalid id | Only super admin can remove movie",
    schema: BadRequestParamSchema,
  }),
  ApiForbiddenResponse({
    description: "Cannot Remove Movie | Forbidden resource",
    schema: ForbiddenSchema,
  }),
  ApiParam({ name: "id", description: "The id of the movie", type: "number" }),
  ApiOkResponse({ description: "Remove movie success", schema: SuccessSchema }),
  ApiForbiddenResponse({
    description: "Forbidden resource",
    schema: ForbiddenSchema,
  }),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiOperation({ summary: "remove movie" })
);

//* Update movie decorator
export const UpdateMovieDecorator = applyDecorators(
  Role(Roles.ADMIN, Roles.SUPER_ADMIN),
  UseGuards(JwtGuard, RoleGuard),
  ApiCookieAuth(),
  ApiConsumes("multipart/form-data"),
  UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "poster", maxCount: 1 },
        { name: "video", maxCount: 1 },
      ],
      {
        fileFilter: movieFileFilter,
        limits: { fileSize: 30 * 1024 * 1024, files: 2 },
        storage: memoryStorage(),
      }
    )
  ),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
  ApiBadRequestResponse({
    description: "Invalid id | Only super admin can remove movie",
    schema: BadRequestParamSchema,
  }),
  ApiNotFoundResponse({
    description: "industry | genre | actor not found",
    schema: NotFoundSchema,
  }),
  ApiOkResponse({ description: "Updated success", schema: SuccessSchema }),
  ApiForbiddenResponse({
    description: "Forbidden resource | Cannot update movie",
    schema: ForbiddenSchema,
  }),
  ApiOperation({ summary: "update a movie" })
);

//* Like movie decorator
export const LikeMovieDecorator = applyDecorators(
  HttpCode(HttpStatus.OK),
  UseGuards(JwtGuard),
  ApiCookieAuth(),
  ApiForbiddenResponse({
    description: "Forbidden resource",
    schema: ForbiddenSchema,
  }),
  ApiParam({
    name: "id",
    description: "The id of the movie",
    type: "number",
    example: 1,
  }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiOkResponse({
    description: "Liked success | Unliked success",
    schema: SuccessSchema,
  }),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
  ApiBadRequestResponse({
    description: "Invalid id",
    schema: BadRequestParamSchema,
  }),
  ApiOperation({ summary: "like a movie" })
);

//* Bookmark movie decorator
export const BookmarkMovieDecorator = applyDecorators(
  HttpCode(HttpStatus.OK),
  UseGuards(JwtGuard),
  ApiCookieAuth(),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiForbiddenResponse({
    description: "Forbidden resource",
    schema: ForbiddenSchema,
  }),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
  ApiParam({
    name: "id",
    description: "The id of the movie",
    type: "number",
    example: 1,
  }),
  ApiBadRequestResponse({
    description: "Invalid id",
    schema: BadRequestParamSchema,
  }),
  ApiOkResponse({
    description: "Bookmark success | UnBookmark success",
    schema: SuccessSchema,
  }),
  ApiOperation({ summary: "bookmark a movie" })
);

//* Get bookmark history decorator
export const GetBookmarkHistoryDecorator = applyDecorators(
  Role(Roles.ADMIN, Roles.SUPER_ADMIN),
  UseGuards(JwtGuard, RoleGuard),
  ApiQuery({
    name: "page",
    type: "string",
    description: "The page of the bookmarks",
    required: false,
    example: 1,
  }),
  ApiQuery({
    name: "limit",
    type: "string",
    description: "The count of the bookmarks",
    required: false,
    example: 10,
  }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
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
    schema: BookmarkAndLikeHistorySchema,
  }),
  ApiOperation({ summary: "get movies bookmarks by admins" })
);

//* Get like history decorator
export const GetLikeHistoryDecorator = applyDecorators(
  Role(Roles.ADMIN, Roles.SUPER_ADMIN),
  UseGuards(JwtGuard, RoleGuard),
  ApiCookieAuth(),
  ApiQuery({
    name: "page",
    type: "string",
    description: "The page of the likes",
    required: false,
    example: 1,
  }),
  ApiQuery({
    name: "limit",
    type: "string",
    description: "The count of the likes",
    required: false,
    example: 10,
  }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
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
    schema: BookmarkAndLikeHistorySchema,
  }),
  ApiOperation({ summary: "get movies likes by admins" })
);
