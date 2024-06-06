import { UseGuards, UseInterceptors, applyDecorators } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { AuthGuard } from "../../modules/auth/guards/Auth.guard";
import { IsAdminGuard } from "../../modules/auth/guards/isAdmin.guard";
import { fileFilter } from "../../common/utils/upload-file.util";
import { memoryStorage } from "multer";
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
export const UpdateCountryDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiCookieAuth(),
  ApiConsumes("multipart/form-data"),
  ApiNotFoundResponse({ description: "Country not found" }),
  ApiForbiddenResponse({
    description: "Cannot update country | Forbidden resource",
  }),
  ApiOkResponse({ description: "Updated country success" }),
  ApiConflictResponse({ description: "Already exists country" }),
  ApiInternalServerErrorResponse({ description: "Jwt expired" }),
  ApiOperation({ summary: "update country" })
);

//* Remove country decorator
export const RemoveCountryDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiCookieAuth(),
  ApiNotFoundResponse({ description: "Country not found" }),
  ApiForbiddenResponse({
    description: "Cannot Remove Country | Forbidden resource",
  }),
  ApiOkResponse({ description: "Remove country success" }),
  ApiInternalServerErrorResponse({ description: "Jwt expired" }),
  ApiOperation({ summary: "remove country" })
);

//* Get one country decorator
export const GetOneCountryDecorator = applyDecorators(
  ApiOperation({ summary: "get one country by id" }),
  ApiNotFoundResponse({ description: "country not found" }),
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

//* Search Countries decorator
export const SearchCountriesDecorator = applyDecorators(
  ApiOperation({ summary: "search in countries" }),
  ApiBadRequestResponse({ description: "Required country query" }),
  ApiQuery({ name: "country", type: String }),
  ApiOkResponse({ type: [Object] })
);
