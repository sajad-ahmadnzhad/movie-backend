import { SchemaObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import { CreatedBySchema } from "./public.schema";

export const CommentSchema: SchemaObject = {
  type: "object",
  properties: {
    count: {
      type: "number",
      default: 20,
    },
    page: {
      type: "number",
      default: 1,
    },
    pages: {
      type: "number",
      default: 2,
    },
    data: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: {
            type: "number",
            default: 1,
          },
          createdAt: {
            type: "string",
            default: "2024-08-03T09:19:13.000Z",
          },
          updatedAt: {
            type: "string",
            default: "2024-08-03T09:19:13.000Z",
          },
          body: {
            type: "string",
            default: "this is a comment",
          },
          isAccept: {
            type: "boolean",
            default: true,
          },
          isReject: {
            type: "boolean",
            default: false,
          },
          rating: {
            type: "number",
            default: 5,
            maximum: 5,
            minimum: 1,
          },
          isEdit: {
            type: "boolean",
            default: false,
          },
          isReviewed: {
            type: "boolean",
            default: false,
          },
          replies: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: {
                  type: "number",
                  default: 1,
                },
                createdAt: {
                  type: "string",
                  default: "2024-08-03T09:19:13.000Z",
                },
                updatedAt: {
                  type: "string",
                  default: "2024-08-03T09:19:13.000Z",
                },
                body: {
                  type: "string",
                  default: "this is a comment",
                },
                isReject: {
                  type: "boolean",
                  default: false,
                },
                isAccept: {
                  type: "boolean",
                  default: false,
                },
                rating: {
                  type: "number",
                  default: 5,
                  maximum: 5,
                  minimum: 1,
                },
                isEdit: {
                  type: "boolean",
                  default: false,
                },
                isReviewed: {
                  type: "boolean",
                  default: false,
                },
                creator: CreatedBySchema,
              },
            },
          },
          creator: CreatedBySchema,
          movie: {
            type: "object",
            properties: {
              id: {
                type: "number",
                default: 1,
              },
              createdAt: {
                type: "string",
                default: "2024-08-03T09:19:13.000Z",
              },
              updatedAt: {
                type: "string",
                default: "2024-08-03T09:19:13.000Z",
              },
              title: {
                type: "string",
              },
              description: {
                type: "string",
              },
              release_year: {
                type: "number",
                default: 2023,
              },
              poster_URL: {
                type: "string",
                default:
                  " https://movie-backend-bucket.storage.c2.liara.space/posters/my-poster.jpg",
              },
              video_URL: {
                type: "string",
                default:
                  " https://movie-backend-bucket.storage.c2.liara.space/posters/my-poster.jpg",
              },
            },
          },
          parent: {
            type: "object",
            properties: {
              id: {
                type: "number",
                default: 1,
              },
              createdAt: {
                type: "string",
                default: "2024-08-03T09:19:13.000Z",
              },
              updatedAt: {
                type: "string",
                default: "2024-08-03T09:19:13.000Z",
              },
              body: {
                type: "string",
                default: "this is a comment",
              },
              isReject: {
                type: "boolean",
                default: false,
              },
              isAccept: {
                type: "boolean",
                default: false,
              },
              rating: {
                type: "number",
                default: 5,
                maximum: 5,
                minimum: 1,
              },
              isEdit: {
                type: "boolean",
                default: false,
              },
              isReviewed: {
                type: "boolean",
                default: false,
              },
            },
          },
        },
      },
    },
  },
};
