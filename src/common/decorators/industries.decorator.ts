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
} from "@nestjs/swagger";
import { PublicMessages } from "../enum/public.messages";

//* Create industry decorator
export const CreateIndustryDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiCookieAuth(),
  ApiOperation({ summary: "create new industry" }),
  ApiConflictResponse({ description: "Already exists industry" }),
  ApiOkResponse({ description: "Created industry success" }),
  ApiInternalServerErrorResponse({ description: "Jwt expired" }),
  ApiForbiddenResponse({ description: "Forbidden resource" }),
  ApiNotFoundResponse({ description: "Industry not found" })
);

//* Get all industries decorator
export const GetAllIndustriesDecorator = applyDecorators(
  ApiOperation({ summary: "get all industries" }),
  ApiQuery({ name: "page", type: Number, required: false }),
  ApiQuery({ name: "limit", type: Number, required: false }),
  ApiOkResponse({ type: [Object] })
);

//* Get one industry decorator
export const GetOneIndustryDecorator = applyDecorators(
  ApiOperation({ summary: "get one industry by id" }),
  ApiNotFoundResponse({ description: "Industry not found" }),
  ApiBadRequestResponse({ description: PublicMessages.InvalidObjectId }),
  ApiOkResponse({ type: Object })
);

//* Update industry decorator
export const UpdateIndustryDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiCookieAuth(),
  ApiNotFoundResponse({
    description: "Industry not found | Country not found",
  }),
  ApiForbiddenResponse({
    description: "Cannot update country | Forbidden resource",
  }),
  ApiOkResponse({ description: "Updated industry success" }),
  ApiConflictResponse({ description: "Already exists industry" }),
  ApiInternalServerErrorResponse({ description: "Jwt expired" }),
  ApiOperation({ summary: "update industry" })
);

//* Remove industry decorator
export const RemoveIndustryDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiCookieAuth(),
  ApiNotFoundResponse({ description: "Industry not found" }),
  ApiForbiddenResponse({
    description: "Cannot Remove Industry | Forbidden resource",
  }),
  ApiOkResponse({ description: "Remove industry success" }),
  ApiInternalServerErrorResponse({ description: "Jwt expired" }),
  ApiOperation({ summary: "remove industry" })
);

//* Search industries decorator
export const SearchIndustriesDecorator = applyDecorators(
  ApiOperation({ summary: "search in industries" }),
  ApiBadRequestResponse({ description: "Required industry query" }),
  ApiQuery({ name: "industry", type: String }),
  ApiOkResponse({ type: [Object] })
);