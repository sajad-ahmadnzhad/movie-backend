import { SchemaObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import { CreatedBySchema } from "./public.schema";

export const GetOneUserSchema: SchemaObject = {
  type: "object",
  required: [
    "_id",
    "name",
    "username",
    "email",
    "avatarURL",
    "isAdmin",
    "isSuperAdmin",
    "isVerifyEmail",
    "updatedAt",
    "createdAt",
  ],
  properties: {
    _id: {
      type: "string",
      example: "665c933441256dec15de2ce0",
    },
    name: {
      type: "string",
      example: "ali",
    },
    username: {
      type: "string",
      example: "ali_22",
    },
    email: {
      type: "string",
      example: "ali@gmail.com",
    },
    avatarURL: {
      type: "string",
      example: "/uploads/user-avatar/2890.2938233496407--71iPN1z3PXL.png",
    },
    isAdmin: {
      type: "boolean",
      example: true,
    },
    isSuperAdmin: {
      type: "boolean",
      example: true,
    },
    isVerifyEmail: {
      type: "boolean",
      example: true,
    },
    createdAt: {
      type: "string",
      example: "2024-06-02T15:43:48.688Z",
    },
    updatedAt: {
      type: "string",
      example: "2024-06-02T15:43:48.688Z",
    },
  },
};

export const GetAllUsersSchema: SchemaObject = {
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
      items: GetOneUserSchema,
    },
  },
};

export const GetAllBannedUsers: SchemaObject = {
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
      items: {
        type: "object",
        properties: {
          _id: {
            type: "string",
            example: "6661b7e6fee9652dfe13ad5b",
          },
          email: {
            type: "string",
            example: "ali@gmail.com",
          },
          createdBy: CreatedBySchema,
          createdAt: {
            type: "string",
            example: "2024-06-02T15:43:48.688Z",
          },
          updatedAt: {
            type: "string",
            example: "2024-06-02T15:43:48.688Z",
          },
        },
      },
    },
  },
};
