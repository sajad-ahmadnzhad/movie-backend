import { UseGuards, applyDecorators } from "@nestjs/common";
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
  ApiConsumes,
} from "@nestjs/swagger";
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
import { Roles } from "../enums/roles.enum";
import { RoleGuard } from "../guards/auth.guard";
import { JwtGuard } from "../guards/jwt.guard";
import { Role } from "./role.decorator";

//* Create industry decorator
export const CreateIndustryDecorator = applyDecorators(
  Role(Roles.ADMIN, Roles.SUPER_ADMIN),
  UseGuards(JwtGuard, RoleGuard),
  ApiCookieAuth(),
  ApiOperation({ summary: "create new industry" }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  }),
  ApiConsumes("application/json", "application/x-www-form-urlencoded"),
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
    type: "number",
    required: false,
    description: "The page of the industries",
    example: 1,
  }),
  ApiQuery({
    name: "limit",
    type: "number",
    required: false,
    description: "The count of the industry",
    example: 10,
  }),
  ApiQuery({
    name: "country",
    type: "number",
    required: false,
    description: "The id of the country",
    example: 2,
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
    description: "Invalid id",
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
  Role(Roles.ADMIN, Roles.SUPER_ADMIN),
  UseGuards(JwtGuard, RoleGuard),
  ApiCookieAuth(),
  ApiConsumes("application/json", "application/x-www-form-urlencoded"),
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
    description:
      "Already exists industry | Only super admin can update industry",
    schema: ConflictSchema,
  }),
  ApiInternalServerErrorResponse({
    description: "Jwt expired",
    schema: JwtExpiredSchema,
  }),
  ApiParam({
    name: "id",
    description: "The id of the industry",
    type: "number",
  }),
  ApiOperation({ summary: "update industry" })
);

//* Remove industry decorator
export const RemoveIndustryDecorator = applyDecorators(
  Role(Roles.ADMIN, Roles.SUPER_ADMIN),
  UseGuards(JwtGuard, RoleGuard),
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
    description: "Invalid id",
  }),
  ApiConflictResponse({
    schema: BadRequestParamSchema,
    description: "Only super admin can remove industry",
  }),
  ApiParam({
    name: "id",
    description: "The id of the industry",
    type: "number",
  }),
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
    type: "number",
    required: false,
    description: "The page of the industries",
    example: 1,
  }),
  ApiQuery({
    name: "limit",
    type: "number",
    required: false,
    description: "The count of the industry",
    example: 1,
  }),
  ApiOkResponse({ schema: GetAllIndustriesSchema }),
  ApiTooManyRequestsResponse({
    description: "Too many requests",
    schema: TooManyRequests,
  })
);
