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
      example: "validation error",
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

export const ForbiddenSchema: SchemaObject = {
  type: "object",
  properties: {
    message: {
      type: "string",
      example: "This path is protected !!",
    },
    error: {
      type: "string",
      example: "Forbidden resource",
    },
    statusCode: {
      type: "number",
      example: 403,
    },
  },
};

export const ConflictSchema: SchemaObject = {
  type: "object",
  properties: {
    message: {
      type: "string",
    },
    error: {
      type: "string",
      example: "CONFLICT",
    },
    statusCode: {
      type: "number",
      example: 409,
    },
  },
};

export const SuccessSchema: SchemaObject = {
  type: "object",
  properties: {
    message: {
      type: "string",
      example: "Created success",
    },
  },
};

export const NotFoundSchema: SchemaObject = {
  type: "object",
  properties: {
    message: {
      type: "string",
      example: "User not found",
    },
    error: {
      type: "string",
      example: "Not Found",
    },
    statusCode: {
      type: "number",
      example: 404,
    },
  },
};

export const TooManyRequests: SchemaObject = {
  type: "object",
  properties: {
    message: {
      type: "string",
      example: "ThrottlerException: Too Many Requests",
    },
    statusCode: {
      type: "number",
      example: 429,
    },
  },
};
