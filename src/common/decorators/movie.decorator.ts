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
import { AuthGuard } from "../../modules/auth/guards/Auth.guard";
import { IsAdminGuard } from "../../modules/auth/guards/isAdmin.guard";
import { memoryStorage } from "multer";
import { movieFileFilter } from "../utils/upload-file.util";
import { PublicMessages } from "../enum/public.messages";
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
  GetAllMoviesSchema,
  GetOneMovie,
} from "../swagger/schemas/movie.schema";

//* Create movie decorator
export const CreateMovieDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
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
    description: "The page of the movies",
  }),
  ApiQuery({
    name: "limit",
    required: false,
    description: "The count of the movie",
  }),
  ApiQuery({
    name: "release_year",
    required: false,
    description: "release year movie",
  }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiQuery({ name: "country", required: false, description: "country id" }),
  ApiQuery({ name: "actor", required: false, description: "actor id" }),
  ApiQuery({ name: "industry", required: false, description: "industry id" }),
  ApiQuery({ name: "genre", required: false, description: "genre id" }),
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
    description: PublicMessages.InvalidObjectId,
    schema: BadRequestParamSchema,
  }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiParam({ name: "id", description: "The id of the movie" }),
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
    type: String,
    description: "The query of the movie",
  }),
  ApiQuery({
    name: "page",
    type: String,
    description: "The page of the movies",
    required: false,
  }),
  ApiQuery({
    name: "limit",
    type: String,
    description: "The count of the movie",
    required: false,
  }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiOkResponse({ schema: GetAllMoviesSchema })
);

//* Remove movie decorator
export const RemoveMovieDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiCookieAuth(),
  ApiNotFoundResponse({
    description: "Movie not found",
    schema: NotFoundSchema,
  }),
  ApiForbiddenResponse({
    description: "Cannot Remove Movie | Forbidden resource",
    schema: ForbiddenSchema,
  }),
  ApiParam({ name: "id", description: "The id of the movie" }),
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
  UseGuards(AuthGuard, IsAdminGuard),
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
  ApiNotFoundResponse({
    description: "industry | genre | actor not found",
    schema: NotFoundSchema,
  }),
  ApiOkResponse({ description: "Updated success", schema: SuccessSchema }),
  ApiForbiddenResponse({
    description: "Forbidden resource",
    schema: ForbiddenSchema,
  }),
  ApiOperation({ summary: "update a movie" })
);

//* Like movie decorator
export const LikeMovieDecorator = applyDecorators(
  HttpCode(HttpStatus.OK),
  UseGuards(AuthGuard),
  ApiCookieAuth(),
  ApiForbiddenResponse({
    description: "Forbidden resource",
    schema: ForbiddenSchema,
  }),
  ApiParam({ name: "id", description: "The id of the movie" }),
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
  ApiOperation({ summary: "like a movie" })
);

//* Bookmark movie decorator
export const BookmarkMovieDecorator = applyDecorators(
  HttpCode(HttpStatus.OK),
  UseGuards(AuthGuard),
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
  ApiParam({ name: "id", description: "The id of the movie" }),
  ApiBadRequestResponse({
    description: PublicMessages.InvalidObjectId,
    schema: BadRequestParamSchema,
  }),
  ApiOkResponse({
    description: "Bookmark success | UnBookmark success",
    schema: SuccessSchema,
  }),
  ApiOperation({ summary: "bookmark a movie" })
);
