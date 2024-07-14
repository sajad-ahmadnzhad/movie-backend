import { SchemaObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import { CreatedBySchema } from "./public.schema";

export const GetOneActorSchema: SchemaObject = {
  type: "object",
  properties: {
    id: {
      type: "number",
      example: 1,
    },
    name: {
      type: "string",
      example: "salman khan",
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
          example: "/uploads/country-flag/iran.jpg",
        },
        createdAt: {
          type: "string",
          example: "2024-06-08T10:24:58.129Z",
        },
        updatedAt: {
          type: "string",
          example: "2024-06-08T10:24:58.129Z",
        },
      },
    },
    industry: {
      type: "object",
      properties: {
        id: {
          type: "number",
          example: 1,
        },
        name: {
          type: "string",
          example: "hollywood",
        },
        description: {
          type: "string",
        },
        createdAt: {
          type: "string",
          example: "2024-06-08T10:24:58.129Z",
        },
        updatedAt: {
          type: "string",
          example: "2024-06-08T10:24:58.129Z",
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
