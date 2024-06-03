import { UseGuards, UseInterceptors, applyDecorators } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { AuthGuard } from "../../modules/auth/guards/Auth.guard";
import { IsAdminGuard } from "../../modules/auth/guards/isAdmin.guard";
import { fileFilter } from "../../common/utils/upload-file.util";
import { memoryStorage } from "multer";
import {
  ApiConflictResponse,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from "@nestjs/swagger";
import { CountriesMessages } from "../enum/countriesMessages.enum";

//* Create country decorator
export const CreateCountryDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  UseInterceptors(
    FileInterceptor("countryFlag", {
      fileFilter,
      storage: memoryStorage(),
      limits: { fileSize: 2048 * 1024, files: 1 },
    })
  ),
  ApiConsumes("multipart/form-data"),
  ApiOperation({ summary: "create new country" }),
  ApiConflictResponse({ description: CountriesMessages.AlreadyExistsCountry }),
  ApiOkResponse({ description: CountriesMessages.CreatedCountrySuccess }),
  ApiInternalServerErrorResponse({ description: "Jwt expired" }),
  ApiForbiddenResponse({ description: "Forbidden resource" })
);

//* Update country decorator
export const UpdateCountryDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  UseInterceptors(
    FileInterceptor("countryFlag", {
      fileFilter,
      storage: memoryStorage(),
      limits: { fileSize: 2048 * 1024, files: 1 },
    })
  ),
  ApiConsumes("multipart/form-data"),
  ApiNotFoundResponse({ description: CountriesMessages.NotFoundCountry }),
  ApiForbiddenResponse({
    description:
      CountriesMessages.CannotUpdateCountry + " | Forbidden resource",
  }),
  ApiOkResponse({ description: CountriesMessages.UpdatedCountrySuccess }),
  ApiConflictResponse({ description: CountriesMessages.AlreadyExistsCountry }),
  ApiInternalServerErrorResponse({ description: "Jwt expired" }),
  ApiOperation({ summary: "update country" })
);

//* Remove country decorator
export const RemoveCountryDecorator = applyDecorators(
  UseGuards(AuthGuard, IsAdminGuard),
  ApiNotFoundResponse({ description: CountriesMessages.NotFoundCountry }),
  ApiForbiddenResponse({
    description:
      CountriesMessages.CannotRemoveCountry + " | Forbidden resource",
  }),
  ApiOkResponse({ description: CountriesMessages.RemoveCountrySuccess }),
  ApiInternalServerErrorResponse({ description: "Jwt expired" }),
  ApiOperation({ summary: "remove country" })
);

//* Get one country decorator
export const GetOneCountryDecorator = applyDecorators(
  ApiOperation({ summary: "get one country by id" }),
  ApiOkResponse({type: Object})
)