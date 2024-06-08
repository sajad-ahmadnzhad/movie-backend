import { UseGuards, UseInterceptors, applyDecorators } from "@nestjs/common";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { ApiConsumes, ApiOperation } from "@nestjs/swagger";
import { AuthGuard } from "src/modules/auth/guards/Auth.guard";
import { IsAdminGuard } from "src/modules/auth/guards/isAdmin.guard";
import multer, { memoryStorage } from "multer";
import { movieFileFilter } from "../utils/upload-file.util";

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
  )
);
