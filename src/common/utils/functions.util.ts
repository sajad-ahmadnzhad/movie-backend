import * as bcrypt from "bcrypt";

export const hashData = (data: string, salt: number): string => {
  return bcrypt.hashSync(data, salt);
};

export const transformIds = ({
  value,
}: {
  value: string | string[];
}): number[] => {
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

  if (value) {
    return value
      .filter((val) => typeof val == "number" || val.trim())
      .map(Number);
  }

  return [];
};
