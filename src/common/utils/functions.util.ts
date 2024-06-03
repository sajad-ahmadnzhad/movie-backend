import { HttpException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import * as path from "path";
import { rimrafSync } from "rimraf";
export const hashData = (data: string, salt: number): string => {
  return bcrypt.hashSync(data, salt);
};

export const sendError = (
  message: string,
  statusCode: number
): HttpException => {
  if (statusCode > 500 || !statusCode) statusCode = 500;

  return new HttpException(message, statusCode);
};

export const removeFile = (filePath: string): void => {
  const removeFilePath = path.join(process.cwd(), "public", filePath);

  rimrafSync(removeFilePath);
};
