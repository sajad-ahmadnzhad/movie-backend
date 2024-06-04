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
} from "@nestjs/swagger";

//* Create industry decorator
export const CreateIndustryDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
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
