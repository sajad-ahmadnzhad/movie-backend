import { SchemaObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";;
import { GetOneUserSchema } from "./user.schema";

export const GetOneGenreSchema: SchemaObject = {
  type: "object",
  description: "Get genre",
  properties: {
    id: {
      type: "number",
      example: 1,
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
    createdBy: GetOneUserSchema,
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
