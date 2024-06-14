import { SchemaObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

export const BadRequestBodySchema: SchemaObject = {
  type: "object",
  properties: {
    message: {
      type: "array",
      items: {
        type: "string",
        example: "name must be longer than or equal to 3 characters",
      },
    },
    error: {
      type: "string",
      example: "Bad Request",
    },
    statusCode: {
      type: "number",
      example: 400,
    },
  },
};

export const BadRequestParamSchema: SchemaObject = {
  type: "object",
  properties: {
    message: {
      type: "string",
      example: "This id is not from mongodb",
    },
    error: {
      type: "string",
      example: "Bad Request",
    },
    statusCode: {
      type: "number",
      example: 400,
    },
  },
};

export const JwtExpiredSchema: SchemaObject = {
  type: "object",
  properties: {
    message: {
      type: "string",
      example: "jwt expired",
    },
    error: {
      type: "string",
      example: "Internal Server Error",
    },
    statusCode: {
      type: "number",
      example: 500,
    },
  },
};
