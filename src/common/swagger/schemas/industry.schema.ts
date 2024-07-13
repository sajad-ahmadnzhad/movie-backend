import { SchemaObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import { GetOneUserSchema } from "./user.schema";

export const GetOneIndustrySchema: SchemaObject = {
  type: "object",
  properties: {
    id: {
      type: "number",
      example: 1,
    },
    name: { type: "string", example: "hollywood" },
    description: { type: "string" },
    country: {
      type: "object",
      properties: {
        id: {
          type: "number",
          example: 1,
        },
        name: { type: "string", example: "usa" },
        description: { type: "string" },
        flag_image_URL: { type: "string" },
        createdAt: {
          type: "string",
          example: "2024-06-09T07:48:12.918Z",
        },
        updatedAt: {
          type: "string",
          example: "2024-06-09T07:48:12.918Z",
        },
      },
    },
    createdBy: GetOneUserSchema,
    createdAt: {
      type: "string",
      example: "2024-06-09T07:48:12.918Z",
    },
    updatedAt: {
      type: "string",
      example: "2024-06-09T07:48:12.918Z",
    },
  },
};

export const GetAllIndustriesSchema: SchemaObject = {
  type: "object",
  properties: {
    count: {
      type: "number",
      example: 1,
    },
    page: {
      type: "number",
      example: 1,
    },
    pages: {
      type: "number",
      example: 2,
    },
    data: {
      type: "array",
      items: GetOneIndustrySchema,
    },
  },
};
