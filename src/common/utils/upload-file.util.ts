import { BadRequestException } from "@nestjs/common";
import multer from "multer";
import * as path from "path";
import * as fs from "fs";
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

export function saveFile(file: Express.Multer.File, pathName: string): string {
  const extname = path.extname(file.originalname);
  const filename = file.originalname?.split(".")?.[0];
  const newFilename = `${Date.now()}${Math.random() * 9999}--${filename.replaceAll(" ", "-")}${extname}`;

  const filePath = `${process.cwd()}/public//uploads/${pathName}/${newFilename}`;
  fs.writeFileSync(filePath, file.buffer);

  return newFilename;
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

export function saveMovieFile(
  files: {
    poster: Express.Multer.File[];
    video: Express.Multer.File[];
  },
  paths: { posterPath: string; videoPath: string }
): Partial<{ posterName: string; videoName: string }> {
  const newFileNames: Partial<{ posterName: string; videoName: string }> = {};

  if (files.video[0].fieldname == "video") {
    newFileNames.videoName = saveFile(files.video[0], paths.videoPath);
  }

  if (files.poster[0].fieldname == "poster") {
    newFileNames.posterName = saveFile(files.poster[0], paths.posterPath);
  }

  return newFileNames;
}
