import { UseGuards, applyDecorators } from "@nestjs/common";
import { AuthGuard } from "../../modules/auth/guards/Auth.guard";
import { IsAdminGuard } from "../../modules/auth/guards/isAdmin.guard";
import {
  ApiOperation,
  ApiConflictResponse,
  ApiOkResponse,
  ApiInternalServerErrorResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiQuery,
  ApiBadRequestResponse,
  ApiCookieAuth,
  ApiParam,
  ApiCreatedResponse,
  ApiTooManyRequestsResponse,
} from "@nestjs/swagger";
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
  GetAllIndustriesSchema,
  GetOneIndustrySchema,
} from "../swagger/schemas/industry.schema";

//* Create industry decorator
export const CreateIndustryDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiCookieAuth(),
  ApiOperation({ summary: "create new industry" }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiConflictResponse({
    description: "Already exists industry",
    schema: ConflictSchema,
  }),
  ApiCreatedResponse({
    description: "Created industry success",
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
    description: "Country not found",
    schema: NotFoundSchema,
  }),
  ApiBadRequestResponse({
    description: "Industry validation error",
    schema: BadRequestBodySchema,
  })
);

//* Get all industries decorator
export const GetAllIndustriesDecorator = applyDecorators(
  ApiOperation({ summary: "get all industries" }),
  ApiQuery({
    name: "page",
    type: Number,
    required: false,
    description: "The page of the industries",
  }),
  ApiQuery({
    name: "limit",
    type: Number,
    required: false,
    description: "The count of the industry",
  }),
  ApiOkResponse({ schema: GetAllIndustriesSchema }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  })
);

//* Get one industry decorator
export const GetOneIndustryDecorator = applyDecorators(
  ApiOperation({ summary: "get one industry by id" }),
  ApiNotFoundResponse({
    description: "Industry not found",
    schema: NotFoundSchema,
  }),
  ApiBadRequestResponse({
    description: PublicMessages.InvalidObjectId,
    schema: BadRequestParamSchema,
  }),
  ApiParam({ name: "id", description: "The id of the industry" }),
  ApiOkResponse({ schema: GetOneIndustrySchema }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  })
);

//* Update industry decorator
export const UpdateIndustryDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiCookieAuth(),
  ApiNotFoundResponse({
    description: "Industry not found | Country not found",
    schema: NotFoundSchema,
  }),
  ApiForbiddenResponse({
    description: "Cannot update country | Forbidden resource",
    schema: ForbiddenSchema,
  }),
  ApiBadRequestResponse({
    schema: BadRequestBodySchema,
    description: "Industry validation error",
  }),
  ApiOkResponse({
    description: "Updated industry success",
    schema: SuccessSchema,
  }),
  ApiConflictResponse({
    description: "Already exists industry",
    schema: ConflictSchema,
  }),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
  ApiParam({ name: "id", description: "The id of the industry" }),
  ApiOperation({ summary: "update industry" })
);

//* Remove industry decorator
export const RemoveIndustryDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiCookieAuth(),
  ApiNotFoundResponse({
    description: "Industry not found",
    schema: NotFoundSchema,
  }),
  ApiForbiddenResponse({
    description: "Cannot Remove Industry | Forbidden resource",
    schema: ForbiddenSchema,
  }),
  ApiOkResponse({
    description: "Remove industry success",
    schema: SuccessSchema,
  }),
  ApiBadRequestResponse({
    schema: BadRequestParamSchema,
    description: "This id is not from mongodb",
  }),
  ApiParam({ name: "id", description: "The id of the industry" }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
  ApiOperation({ summary: "remove industry" })
);

//* Search industries decorator
export const SearchIndustriesDecorator = applyDecorators(
  ApiOperation({ summary: "search in industries" }),
  ApiBadRequestResponse({
    description: "Required industry query",
    schema: BadRequestParamSchema,
  }),
  ApiQuery({
    name: "industry",
    type: "string",
    description: "The query of the industry",
  }),
  ApiQuery({
    name: "page",
    type: Number,
    required: false,
    description: "The page of the industries",
  }),
  ApiQuery({
    name: "limit",
    type: Number,
    required: false,
    description: "The count of the industry",
  }),
  ApiOkResponse({ schema: GetAllIndustriesSchema }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  })
);

//* Get industry by country decorator
export const GetIndustryByCountryDecorator = applyDecorators(
  ApiOperation({ summary: "get industry by country" }),
  ApiNotFoundResponse({
    description: "Country not found",
    schema: NotFoundSchema,
  }),
  ApiParam({ name: "id", description: "The id of the industry" }),
  ApiOkResponse({ schema: GetAllIndustriesSchema }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  })
);
