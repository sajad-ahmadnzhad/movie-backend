import { UseGuards, UseInterceptors, applyDecorators } from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import {
  ApiBadRequestResponse,
  ApiConsumes,
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
  ApiInternalServerErrorResponse({ description: "Jwt expired" }),
  ApiOperation({ summary: "create a movie" }),
  ApiOkResponse({ type: [Object] })
);

//* Get all movies
export const GetAllMoviesDecorator = applyDecorators(
  ApiOperation({ summary: "get all movies" }),
  ApiQuery({ name: "page", type: Number, required: false }),
  ApiQuery({ name: "limit", type: Number, required: false }),
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

//* Get movies by country
export const GetMoviesByCountry = applyDecorators(
  ApiOperation({ summary: "get movies by country" }),
  ApiNotFoundResponse({ description: "Country not found" }),
  ApiParam({ name: "id", description: "Country id" }),
  ApiBadRequestResponse({ description: PublicMessages.InvalidObjectId }),
  ApiOkResponse({ type: [Object] })
);

//* Get movies by industry
export const GetMoviesByIndustry = applyDecorators(
  ApiOperation({ summary: "get movies by industry" }),
  ApiNotFoundResponse({ description: "Industry not found" }),
  ApiParam({ name: "id", description: "Industry id" }),
  ApiBadRequestResponse({ description: PublicMessages.InvalidObjectId }),
  ApiOkResponse({ type: [Object] })
);

//* Get movies by actor
export const GetMoviesByActor = applyDecorators(
  ApiOperation({ summary: "get movies by actor" }),
  ApiNotFoundResponse({ description: "Actor not found" }),
  ApiParam({ name: "id", description: "Actor id" }),
  ApiBadRequestResponse({ description: PublicMessages.InvalidObjectId }),
  ApiOkResponse({ type: [Object] })
);

//* Get movies by genre
export const GetMoviesByGenre = applyDecorators(
  ApiOperation({ summary: "get movies by genre" }),
  ApiNotFoundResponse({ description: "Genre not found" }),
  ApiParam({ name: "id", description: "Genre id" }),
  ApiBadRequestResponse({ description: PublicMessages.InvalidObjectId }),
  ApiOkResponse({ type: [Object] })
);
