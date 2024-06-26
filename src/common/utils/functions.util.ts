import { HttpException, HttpStatus, NotFoundException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { Model } from "mongoose";
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

  return new HttpException(
    {
      message,
      error: HttpStatus[statusCode],
      statusCode,
    },
    statusCode
  );
  
};

export const removeFile = (filePath: string | undefined): void => {
  if (!filePath) return;

  const removeFilePath = path.join(process.cwd(), "public", filePath);

  rimrafSync(removeFilePath);
};

export const existingObjectIds = async <T>(
  model: Model<T>,
  objectIds: string[],
  fieldName: string
): Promise<void> => {
  const promises = objectIds.map((id) => {
    return model.findById(id);
  });

  const existingActors = await Promise.all(promises);

  for (let i = 0; i < existingActors.length; i++) {
    if (!existingActors[i]) {
      throw new NotFoundException(
        `${fieldName} with this id ${objectIds[i]} not found`
      );
    }
  }
};

export const getMovieCountries = async <T>(
  model: Model<T>,
  objectIds: string[]
) => {
  const countriesPromises = objectIds.map((id) => {
    return model
      .findById(id)
      .select("country")
      .then((result: any) => result.country._id.toString());
  });

  const ids = await Promise.all(countriesPromises);

  return [...new Set(ids)];
};
