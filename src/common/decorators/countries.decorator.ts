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
  ApiConsumes("multipart/form-data")
);
