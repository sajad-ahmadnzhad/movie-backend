import { SchemaObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import { CreatedBySchema } from "./public.schema";

export const GetOneCountrySchema: SchemaObject = {
  type: "object",
  properties: {
    id: {
      type: "number",
      example: 1,
    },
    name: {
      type: "string",
      example: "usa",
    },
    description: {
      type: "string",
    },
    flag_image_URL: {
      type: "string",
      example: "/uploads/country-flag/171742.1145530829754--movie-backend.png",
    },
    createdBy: CreatedBySchema,
    createdAt: {
      type: "string",
      example: "2024-06-03T14:36:17.671Z",
    },
    updatedAt: {
      type: "string",
      example: "2024-06-03T14:36:17.671Z",
    },
  },
};

export const GetAllCountriesSchema: SchemaObject = {
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
      items: GetOneCountrySchema,
    },
  },
};
