import { UseGuards, applyDecorators } from "@nestjs/common";
import { AuthGuard } from "../../modules/auth/guards/Auth.guard";
import { IsAdminGuard } from "../../modules/auth/guards/isAdmin.guard";
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
import { PublicMessages } from "../enum/public.messages";

//* Create Genre decorator
export const CreateGenreDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiCookieAuth(),
  ApiOperation({ summary: "create new genre" }),
  ApiConflictResponse({ description: "Already exists genre" }),
  ApiOkResponse({ description: "Created genre success" }),
  ApiInternalServerErrorResponse({ description: "Jwt expired" }),
  ApiForbiddenResponse({ description: "Forbidden resource" })
);

//* Update Genre decorator
export const UpdateGenreDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiCookieAuth(),
  ApiNotFoundResponse({ description: "Genre not found" }),
  ApiForbiddenResponse({
    description: "Cannot update genre | Forbidden resource",
  }),
  ApiOkResponse({ description: "Updated genre success" }),
  ApiConflictResponse({ description: "Already exists Genre" }),
  ApiInternalServerErrorResponse({ description: "Jwt expired" }),
  ApiOperation({ summary: "update genre" })
);

//* Remove genre decorator
export const RemoveGenreDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiCookieAuth(),
  ApiNotFoundResponse({ description: "Genre not found" }),
  ApiForbiddenResponse({
    description: "Cannot Remove genre | Forbidden resource",
  }),
  ApiOkResponse({ description: "Remove genre success" }),
  ApiInternalServerErrorResponse({ description: "Jwt expired" }),
  ApiOperation({ summary: "remove genre" })
);

//* Get one genre decorator
export const GetOneGenreDecorator = applyDecorators(
  ApiOperation({ summary: "get one genre by id" }),
  ApiNotFoundResponse({ description: "genre not found" }),
  ApiBadRequestResponse({ description: PublicMessages.InvalidObjectId }),
  ApiOkResponse({ type: Object })
);

//* Get all genres
export const GetAllGenresDecorator = applyDecorators(
  ApiOperation({ summary: "get all genres" }),
  ApiQuery({ name: "page", type: Number, required: false }),
  ApiQuery({ name: "limit", type: Number, required: false }),
  ApiOkResponse({ type: [Object] })
);

//* Search Genres decorator
export const SearchGenresDecorator = applyDecorators(
  ApiOperation({ summary: "search in genres" }),
  ApiBadRequestResponse({ description: "Required genre query" }),
  ApiQuery({ name: "genre", type: String }),
  ApiOkResponse({ type: [Object] })
);
