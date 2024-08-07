import { SchemaObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";
import { CreatedBySchema } from "./public.schema";
import { GetOneUserSchema } from "./user.schema";

const RowMovieSchema: SchemaObject = {
  type: "object",
  properties: {
    id: {
      type: "number",
      example: 1,
    },
    title: {
      type: "string",
      example: "Boos 2013",
    },
    description: {
      type: "string",
    },
    release_year: {
      type: "number",
      example: 2013,
    },
    poster_URL: {
      type: "string",
      example: "/uploads/posters/24555.51533071671--photo-09-22_22-58.jpg",
    },
    video_URL: {
      type: "string",
      example: "/uploads/movies/1717433950785T68ci0AlwaymCxwCkjB2.mp4",
    },
    createdAt: {
      type: "string",
      example: "2024-06-09T10:32:25.954Z",
    },
    updatedAt: {
      type: "string",
      example: "2024-06-09T10:32:25.954Z",
    },
  },
};

export const GetOneMovie: SchemaObject = {
  type: "object",
  properties: {
    id: {
      type: "number",
      example: 1,
    },
    title: {
      type: "string",
      example: "Boos 2013",
    },
    description: {
      type: "string",
    },
    release_year: {
      type: "number",
      example: 2013,
    },
    poster_URL: {
      type: "string",
      example:
        "https://movie-backend-bucket.storage.c2.liara.space/posters/my-poster.jpg",
    },
    video_URL: {
      type: "string",
      example:
        "https://movie-backend-bucket.storage.c2.liara.space/movies/my-movie.mp4",
    },
    countries: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: {
            type: "number",
            example: 1,
          },
          name: {
            type: "string",
            example: "india",
          },
          description: {
            type: "string",
          },
          flag_image_URL: {
            type: "string",
            example:
              " https://movie-backend-bucket.storage.c2.liara.space/countries-flag/my-country.jpg",
          },
          createdAt: {
            type: "string",
            example: "2024-06-09T10:32:25.954Z",
          },
          updatedAt: {
            type: "string",
            example: "2024-06-09T10:32:25.954Z",
          },
        },
      },
    },
    genres: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: {
            type: "number",
            example: 1,
          },
          name: {
            type: "string",
            example: "action",
          },
          description: {
            type: "string",
          },
          createdAt: {
            type: "string",
            example: "2024-06-09T10:32:25.954Z",
          },
          updatedAt: {
            type: "string",
            example: "2024-06-09T10:32:25.954Z",
          },
        },
      },
    },
    actors: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: {
            type: "number",
            example: 1,
          },
          name: {
            type: "string",
            example: "Akshay kuomar",
          },
          photo: {
            type: "string",
            example:
              " https://movie-backend-bucket.storage.c2.liara.space/actors-photo/my-actor.jpg",
          },
          bio: {
            type: "string",
          },
          createdAt: {
            type: "string",
            example: "2024-06-09T10:32:25.954Z",
          },
          updatedAt: {
            type: "string",
            example: "2024-06-09T10:32:25.954Z",
          },
        },
      },
    },
    industries: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: {
            type: "number",
            example: 1,
          },
          name: {
            type: "string",
            example: "bollywood",
          },
          description: {
            type: "string",
          },
          createdAt: {
            type: "string",
            example: "2024-06-09T10:32:25.954Z",
          },
          updatedAt: {
            type: "string",
            example: "2024-06-09T10:32:25.954Z",
          },
        },
      },
    },
    createdBy: CreatedBySchema,
    createdAt: {
      type: "string",
      example: "2024-06-09T10:32:25.954Z",
    },
    updatedAt: {
      type: "string",
      example: "2024-06-09T10:32:25.954Z",
    },
    countVisits: {
      type: "number",
      example: 100,
    },
    likes: {
      type: "number",
      example: 1,
    },
    bookmarks: {
      type: "number",
      example: 1,
    },
  },
};

export const GetAllMoviesSchema: SchemaObject = {
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
      items: GetOneMovie,
    },
  },
};

export const GetMyBookmarksSchema: SchemaObject = {
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
            example: 1,
          },
          movie: RowMovieSchema,
          createdAt: {
            type: "string",
            example: "2024-06-09T10:32:25.954Z",
          },
          updatedAt: {
            type: "string",
            example: "2024-06-09T10:32:25.954Z",
          },
        },
      },
    },
  },
};

export const BookmarkAndLikeHistorySchema: SchemaObject = {
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
        properties: {
          id: {
            type: "number",
            example: 1,
          },
          createdAt: {
            type: "string",
            example: "2024-06-09T10:32:25.954Z",
          },
          updatedAt: {
            type: "string",
            example: "2024-06-09T10:32:25.954Z",
          },
          user: GetOneUserSchema,
          movie: RowMovieSchema,
        },
      },
    },
  },
};
