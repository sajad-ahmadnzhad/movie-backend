import { SchemaObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

export const GetOneGenreSchema: SchemaObject = {
  type: "object",
  description: "Get genre",
  required: ["createdBy", "_id", "name"],
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
    createdBy: {
      type: "object",
      required: [
        "_id",
        "name",
        "username",
        "avatarURL",
        "createdAt",
        "updatedAt",
      ],
      properties: {
        _id: {
          type: "string",
          example: "6664317a74eb5d975e91560d",
        },
        name: {
          type: "string",
          example: "ali",
        },
        username: {
          type: "string",
          example: "ali_22",
        },
        avatarURL: {
          type: "string",
          example: "/uploads/user-avatar/171890.2938233496407--71iPN1z3PXL.png",
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
  },
};
export const NotFoundGenre: SchemaObject = {
  type: "object",
  properties: {
    message: {
      type: "string",
      example: "Genre not found",
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
