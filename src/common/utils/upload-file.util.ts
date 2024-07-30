import { BadRequestException } from "@nestjs/common";
import multer from "multer";
import * as path from "path";
import { Request } from "express";

export function fileFilter(
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
): void {
  const exts = [".jpg", ".png"];

  const fileExt = path.extname(file.originalname);
  if (!exts.includes(fileExt)) {
    return cb(new BadRequestException("The file extension is invalid"));
  }
  cb(null, true);
}

export function movieFileFilter(
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  if (file.fieldname == "poster") {
    const exts = [".jpg", ".png"];

    const fileExt = path.extname(file.originalname);
    if (!exts.includes(fileExt)) {
      return cb(new BadRequestException(`The poster extension is invalid`));
    }
  }

  if (file.fieldname == "video") {
    const exts = [".mkv", ".mp4"];

    const fileExt = path.extname(file.originalname);
    if (!exts.includes(fileExt)) {
      return cb(new BadRequestException("The video extension is invalid"));
    }
  }

  cb(null, true);
}
