import { Module } from "@nestjs/common";
import { MoviesService } from "./services/movies.service";
import { MoviesController } from "./controllers/movies.controller";
import { CommentsController } from "./controllers/comments.controller";
import { CommentsService } from "./services/comments.service";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../auth/entities/user.entity";
import { BanUser } from "../auth/entities/banUser.entity";
import { Actor } from "../actors/entities/actor.entity";
import { Industry } from "../industries/entities/industry.entity";
import { Movie } from "./entities/movie.entity";
import { Bookmark } from "./entities/bookmark.entity";
import { Comment } from "./entities/comment.entity";
import { Like } from "./entities/like.entity";
import { Genre } from "../genres/entities/genre.entity";
import { Country } from "../countries/entities/country.entity";
import { AwsSdkModule } from "nest-aws-sdk";
import { S3 } from "aws-sdk";
import { S3Service } from "../s3/s3.service";
import { MoviesGateway } from "./movies.gateway";

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
      Country,
    ]),
    AwsSdkModule.forFeatures([S3]),
  ],
  controllers: [MoviesController, CommentsController],
  providers: [MoviesService, S3Service, CommentsService, MoviesGateway],
})
export class MoviesModule {}
