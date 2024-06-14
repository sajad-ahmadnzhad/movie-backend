import { SchemaObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import { CreatedBySchema } from "./public.schema";

export const GetOneActorSchema: SchemaObject = {
  type: "object",
  required: [
    "_id",
    "name",
    "country",
    "industry",
    "createdBy",
    "createdAt",
    "updatedAt",
  ],
  properties: {
    _id: {
      type: "string",
      example: "6660ba084db733818a6a963f",
    },
    name: {
      type: "string",
      example: "ana de armas",
    },
    bio: {
      type: "string",
    },
    photo: {
      type: "string",
      example: "/uploads/actor-photo/16.9090929--photo_2023-04-08_15-18-36.jpg",
    },
    country: {
      type: "object",
      required: ["_id", "name"],
      properties: {
        _id: {
          type: "string",
          example: "6660ba084db733818a6a963f",
        },
        name: {
          type: "string",
          example: "usa",
        },
        description: {
          type: "string",
        },
      },
    },
    industry: {
      type: "object",
      required: ["_id", "name"],
      properties: {
        _id: {
          type: "string",
          example: "6660ba084db733818a6a963f",
        },
        name: {
          type: "string",
          example: "hollywood",
        },
        description: {
          type: "string",
        },
      },
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

export const GetAllActorsSchema: SchemaObject = {
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
      items: GetOneActorSchema,
    },
  },
};
