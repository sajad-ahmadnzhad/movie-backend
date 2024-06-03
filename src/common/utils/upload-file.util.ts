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
  const newFilename = `${Date.now()}${Math.random() * 9999}--${filename}${extname}`;

  const filePath = `${process.cwd()}/public//uploads/${pathName}/${newFilename}`;
  fs.writeFileSync(filePath, file.buffer);

  return newFilename;
}
