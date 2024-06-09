import { UseGuards, UseInterceptors, applyDecorators } from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
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
} from "@nestjs/swagger";
import { AuthGuard } from "../../modules/auth/guards/Auth.guard";
import { IsAdminGuard } from "../../modules/auth/guards/isAdmin.guard";
import { memoryStorage } from "multer";
import { movieFileFilter } from "../utils/upload-file.util";
import { PublicMessages } from "../enum/public.messages";

//* Create movie decorator
export const CreateMovieDecorator = applyDecorators(
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
  ApiNotFoundResponse({
    description: "industry | genre | actor not found",
  }),
  ApiBadRequestResponse({ description: "Required poster and video" }),
  ApiInternalServerErrorResponse({ description: "Jwt expired" }),
  ApiForbiddenResponse({ description: "Forbidden resource" }),
  ApiOperation({ summary: "create a movie" }),
  ApiOkResponse({ description: "Created movie success" })
);

//* Get all movies
export const GetAllMoviesDecorator = applyDecorators(
  ApiOperation({ summary: "get all movies" }),
  ApiQuery({ name: "page", required: false, description: "count pages" }),
  ApiQuery({ name: "limit", required: false, description: "count documents" }),
  ApiQuery({
    name: "release_year",
    required: false,
    description: "release year movie",
  }),
  ApiQuery({ name: "country", required: false, description: "country id" }),
  ApiQuery({ name: "actor", required: false, description: "actor id" }),
  ApiQuery({ name: "industry", required: false, description: "industry id" }),
  ApiQuery({ name: "genre", required: false, description: "genre id" }),
  ApiOkResponse({ type: [Object] })
);

//* Get one movie decorator
export const GetOneMovieDecorator = applyDecorators(
  ApiOperation({ summary: "get one movie by id" }),
  ApiNotFoundResponse({ description: "Movie not found" }),
  ApiBadRequestResponse({ description: PublicMessages.InvalidObjectId }),
  ApiOkResponse({ type: Object })
);

//* Search movies decorator
export const SearchMoviesDecorator = applyDecorators(
  ApiOperation({ summary: "search in movies" }),
  ApiBadRequestResponse({ description: "Required movie query" }),
  ApiQuery({ name: "movie", type: String }),
  ApiOkResponse({ type: [Object] })
);

//* Remove movie decorator
export const RemoveMovieDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiCookieAuth(),
  ApiNotFoundResponse({ description: "Movie not found" }),
  ApiForbiddenResponse({
    description: "Cannot Remove Movie | Forbidden resource",
  }),
  ApiOkResponse({ description: "Remove movie success" }),
  ApiForbiddenResponse({ description: "Forbidden resource" }),
  ApiInternalServerErrorResponse({ description: "Jwt expired" }),
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
  ApiInternalServerErrorResponse({ description: "Jwt expired" }),
  ApiNotFoundResponse({ description: "industry | genre | actor not found" }),
  ApiOkResponse({ description: "Updated success" }),
  ApiForbiddenResponse({ description: "Forbidden resource" }),
  ApiOperation({ summary: "update a movie" })
);

//* Like movie decorator
export const LikeMovieDecorator = applyDecorators(
  UseGuards(AuthGuard),
  ApiCookieAuth(),
  ApiForbiddenResponse({ description: "Forbidden resource" }),
  ApiConflictResponse({ description: "Already Liked Movie" }),
  ApiBadRequestResponse({ description: "Invalid ObjectId" }),
  ApiOkResponse({ description: "Liked success" }),
  ApiOperation({ summary: "like a movie" })
);

//* Get likes decorator
export const GetLikesDecorator = applyDecorators(
  ApiBadRequestResponse({ description: "Invalid ObjectId" }),
  ApiNotFoundResponse({ description: "Movie not found" }),
  ApiParam({ name: "id", description: "Movie id" }),
  ApiOperation({ summary: "get likes a movie" }),
  ApiOkResponse({ type: [Object] })
);

//* Unlike movie decorator
export const UnlikeMovieDecorator = applyDecorators(
  UseGuards(AuthGuard),
  ApiCookieAuth(),
  ApiForbiddenResponse({ description: "Forbidden resource" }),
  ApiConflictResponse({ description: "Not liked movie" }),
  ApiBadRequestResponse({ description: "Invalid ObjectId" }),
  ApiOkResponse({ description: "Unliked success" }),
  ApiOperation({ summary: "Unlike a movie" })
);
