import { HttpCode, HttpStatus, UseGuards, UseInterceptors, applyDecorators } from "@nestjs/common";
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
import {
  GetAllCountriesSchema,
  GetOneCountrySchema,
} from "../swagger/schemas/country.schema";
import {
  TooManyRequests,
  ConflictSchema,
  SuccessSchema,
  JwtExpiredSchema,
  ForbiddenSchema,
  BadRequestBodySchema,
  NotFoundSchema,
  BadRequestParamSchema,
} from "../swagger/schemas/public.schema";

//* Create country decorator
export const CreateCountryDecorator = applyDecorators(
  HttpCode(HttpStatus.CREATED),
  UseGuards(AuthGuard, IsAdminGuard),
  ApiCookieAuth(),
  UseInterceptors(
    FileInterceptor("countryFlag", {
      fileFilter,
      storage: memoryStorage(),
      limits: { fileSize: 2048 * 1024, files: 1 },
    })
  ),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiConsumes("multipart/form-data"),
  ApiOperation({ summary: "create new country" }),
  ApiConflictResponse({
    description: "Already exists country",
    schema: ConflictSchema,
  }),
  ApiCreatedResponse({
    description: "Created country success",
    schema: SuccessSchema,
  }),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
  ApiBadRequestResponse({
    description: "Country validation error",
    schema: BadRequestBodySchema,
  }),
  ApiForbiddenResponse({
    description: "Forbidden resource",
    schema: ForbiddenSchema,
  })
);

//* Update country decorator
export const UpdateCountryDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiCookieAuth(),
  UseInterceptors(
    FileInterceptor("countryFlag", {
      fileFilter,
      storage: memoryStorage(),
      limits: { fileSize: 2048 * 1024, files: 1 },
    })
  ),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiConsumes("multipart/form-data"),
  ApiNotFoundResponse({
    description: "Country not found",
    schema: NotFoundSchema,
  }),
  ApiForbiddenResponse({
    description: "Cannot update country | Forbidden resource",
    schema: ForbiddenSchema,
  }),
  ApiBadRequestResponse({
    description: "Country validation error",
    schema: BadRequestBodySchema,
  }),
  ApiOkResponse({
    description: "Updated country success",
    schema: SuccessSchema,
  }),
  ApiConflictResponse({
    description: "Already exists country | Only super admin can update country",
    schema: ConflictSchema,
  }),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
  ApiParam({ name: "id", description: "The id of the country" , type: 'number' }),
  ApiOperation({ summary: "update country" })
);

//* Remove country decorator
export const RemoveCountryDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiCookieAuth(),
  ApiNotFoundResponse({
    description: "Country not found",
    schema: NotFoundSchema,
  }),
  ApiBadRequestResponse({
    description: "This id if not from mongodb",
    schema: BadRequestParamSchema,
  }),
  ApiForbiddenResponse({
    description: "Cannot Remove Country | Forbidden resource",
    schema: ForbiddenSchema,
  }),
  ApiOkResponse({
    description: "Remove country success",
    schema: SuccessSchema,
  }),
  ApiConflictResponse({
    description: "Only super admin can remove country",
    schema: SuccessSchema,
  }),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
  ApiParam({ name: "id", description: "The id of the country" , type: 'number' }),
  ApiOperation({ summary: "remove country" }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  })
);

//* Get one country decorator
export const GetOneCountryDecorator = applyDecorators(
  ApiOperation({ summary: "get one country by id" }),
  ApiNotFoundResponse({
    description: "Country not found",
    schema: NotFoundSchema,
  }),
  ApiParam({ name: "id", description: "The id of the country" , type: 'number' }),
  ApiBadRequestResponse({
    description: 'Invalid id',
    schema: BadRequestParamSchema,
  }),
  ApiOkResponse({ schema: GetOneCountrySchema }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  })
);

//* Get all countries
export const GetAllCountriesDecorator = applyDecorators(
  ApiOperation({ summary: "get all countries" }),
  ApiQuery({
    name: "page",
    type: 'number',
    required: false,
    description: "The page of the countries",
    example: 1,
  }),
  ApiQuery({
    name: "limit",
    type: 'number',
    required: false,
    description: "The count of the country",
    example: 10,
  }),
  ApiOkResponse({ schema: GetAllCountriesSchema }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  })
);

//* Search Countries decorator
export const SearchCountriesDecorator = applyDecorators(
  ApiOperation({ summary: "search in countries" }),
  ApiBadRequestResponse({
    description: "Required country query",
    schema: BadRequestParamSchema,
  }),
  ApiQuery({
    name: "country",
    type: 'string',
    description: "The query of the country",
  }),
  ApiQuery({
    name: "page",
    type: 'number',
    required: false,
    description: "The page of the genres",
    example: 1,
  }),
  ApiQuery({
    name: "limit",
    type: 'number',
    required: false,
    description: "The count of the genre",
    example: 10,
  }),
  ApiOkResponse({ schema: GetAllCountriesSchema }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  })
);
