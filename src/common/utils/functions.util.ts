import { UnauthorizedException } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { isJWT } from "class-validator";
import { Request } from "express";

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

export const extractToken = (req: Request) => {
  const { authorization } = req.headers;
  if (!authorization || authorization?.trim() == "") {
    throw new UnauthorizedException();
  }
  const [bearer, token] = authorization?.split(" ");
  if (bearer?.toLowerCase() !== "bearer" || !token || !isJWT(token))
    throw new UnauthorizedException();
  return token;
};
