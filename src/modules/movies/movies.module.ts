import { Module } from "@nestjs/common";
import { MoviesService } from "./services/movies.service";
import { MoviesController } from "./controllers/movies.controller";
import { CommentsController } from "./controllers/comments.controller";
import { CommentsService } from "./services/comments.service";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Actor } from "../actors/entities/actor.entity";
import { Genre } from "../genres/entities/genre.entity";
import { S3Service } from "../s3/s3.service";
import { MoviesGateway } from "./gateways/movies.gateway";
import { CommentsGateway } from "./gateways/comments.gateway";
import { IndustriesModule } from "../industries/industries.module";

@Module({
  imports: [
    IndustriesModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Actor, Genre]),
  ],
  controllers: [MoviesController, CommentsController],
  providers: [
    MoviesService,
    S3Service,
    CommentsService,
    MoviesGateway,
    CommentsGateway,
  ],
})
export class MoviesModule {}
