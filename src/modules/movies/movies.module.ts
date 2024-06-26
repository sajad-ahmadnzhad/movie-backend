import { Module } from "@nestjs/common";
import { MoviesService } from "./services/movies.service";
import { MoviesController } from "./controllers/movies.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "../users/schemas/User.schema";
import { BanUser, BanUserSchema } from "../users/schemas/BanUser.schema";
import { Actor, ActorSchema } from "../actors/schemas/Actor.schema";
import {
  Industry,
  IndustrySchema,
} from "../industries/schemas/Industry.schema";
import { Genre, GenreSchema } from "../genres/schemas/Genre.schema";
import { Movie, MovieSchema } from "./schemas/Movie.schema";
import { Like, LikeSchema } from "./schemas/Like.schema";
import { Bookmark, BookmarkSchema } from "./schemas/Bookmark.schema";
import { CommentsController } from "./controllers/comments.controller";
import { CommentsService } from "./services/comments.service";
import { Comment, CommentSchema } from "./schemas/Comment.schema";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: BanUser.name, schema: BanUserSchema },
      { name: Actor.name, schema: ActorSchema },
      { name: Industry.name, schema: IndustrySchema },
      { name: Genre.name, schema: GenreSchema },
      { name: Movie.name, schema: MovieSchema },
      { name: Like.name, schema: LikeSchema },
      { name: Bookmark.name, schema: BookmarkSchema },
      { name: Comment.name, schema: CommentSchema },
    ]),
  ],
  controllers: [MoviesController, CommentsController],
  providers: [MoviesService, CommentsService],
})
export class MoviesModule {}
