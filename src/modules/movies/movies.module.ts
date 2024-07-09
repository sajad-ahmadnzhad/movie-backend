import { Module } from "@nestjs/common";
import { MoviesService } from "./services/movies.service";
import { MoviesController } from "./controllers/movies.controller";
import { CommentsController } from "./controllers/comments.controller";
import { CommentsService } from "./services/comments.service";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../auth/entities/User.entity";
import { BanUser } from "../auth/entities/banUser.entity";
import { Actor } from "../actors/entities/actor.entity";
import { Industry } from "../industries/entities/industry.entity";
import { Movie } from "./entities/movie.entity";
import { Bookmark } from "./entities/Bookmark.entity";
import { Comment } from "./entities/comment.entity";
import { Like } from "./entities/like.entity";
import { Genre } from "../genres/entities/genre.entity";
import { Country } from "../countries/entities/country.entity";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      User,
      BanUser,
      Actor,
      Industry,
      Movie,
      Bookmark,
      Comment,
      Like,
      Genre,
      Country
    ]),
  ],
  controllers: [MoviesController, CommentsController],
  providers: [MoviesService, CommentsService],
})
export class MoviesModule {}
