import { SchemaObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import { CreatedBySchema } from "./public.schema";

export const GetOneGenreSchema: SchemaObject = {
  type: "object",
  description: "Get genre",
  required: ["createdBy", "_id", "name", "createdAt", "updatedAt"],
  properties: {
    _id: {
      type: "string",
      example: "6664317a74eb5d975e91560d",
    },
    name: {
      type: "string",
      example: "action",
      description: "The name of the genre",
    },
    description: {
      type: "string",
      description: "The description of the genre",
    },
    createdBy: CreatedBySchema,
    createdAt: {
      type: "string",
      example: "2024-06-08T10:24:58.129Z",
    },
    updatedAt: {
      type: "string",
      example: "2024-06-08T10:24:58.129Z",
    },
  },
};

export const GetAllGenresSchema: SchemaObject = {
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
      items: GetOneGenreSchema,
    },
  },
};
