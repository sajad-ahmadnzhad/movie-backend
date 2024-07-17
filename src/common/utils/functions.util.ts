import * as bcrypt from "bcrypt";
import * as path from "path";
import { rimrafSync } from "rimraf";
import { ObjectLiteral, Repository } from "typeorm";

export const hashData = (data: string, salt: number): string => {
  return bcrypt.hashSync(data, salt);
};

export const removeFile = (filePath: string | undefined): void => {
  if (!filePath) return;

  const removeFilePath = path.join(process.cwd(), "public", filePath);

  rimrafSync(removeFilePath);
};

export const transformIds = ({ value }: { value: string | string[] }) => {
  if (typeof value == "string") {
    let parsedValue: any = null;

    try {
      parsedValue = JSON.parse(value);
    } catch {
      parsedValue = value;
    }

    if (Array.isArray(JSON.parse(value))) {
      return parsedValue.flat(Infinity).map(Number);
    }

    return value
      .split(",")
      .filter((val) => val?.trim())
      .map(Number);
  }

  return value
    .filter((val) => typeof val == "number" || val.trim())
    .map(Number);
};

export const existingIds = <T extends ObjectLiteral>(
  ids: number[],
  repository: Repository<T>
): Promise<Awaited<T>[]> => {
  const result = ids.map((id: any) => repository.findOneByOrFail({ id }));
  return Promise.all(result);
};
