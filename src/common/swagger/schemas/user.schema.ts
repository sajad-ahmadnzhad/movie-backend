import { SchemaObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

export const GetOneUserSchema: SchemaObject = {
  type: "object",
  required: [
    "id",
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
    id: {
      type: "number",
      example: 12,
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
      example:
        "https://movie-backend-bucket.storage.c2.liara.space/users-avatar/custom-avatar.jpg",
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
          id: {
            type: "number",
            example: 2,
          },
          email: {
            type: "string",
            example: "ali@gmail.com",
          },
          bannedBy: GetOneUserSchema,
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
