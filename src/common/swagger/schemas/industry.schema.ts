import { SchemaObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import { CreatedBySchema } from "./public.schema";

export const GetOneIndustrySchema: SchemaObject = {
  type: "object",
  required: ["_id", "name", "country", "createdBy", "createdAt", "updatedAt"],
  properties: {
    _id: {
      type: "string",
      example: "66655e3c79ddc29a46ae089f",
    },
    name: { type: "string", example: "hollywood" },
    description: { type: "string" },
    country: {
      type: "object",
      required: ["_id", "name"],
      properties: {
        _id: {
          type: "string",
          example: "66655e3c79ddc29a46ae089f",
        },
        name: { type: "string", example: "usa" },
        description: { type: "string" },
      },
    },
    createdBy: CreatedBySchema,
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
