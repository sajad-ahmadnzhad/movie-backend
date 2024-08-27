import { Module } from "@nestjs/common";
import { IndustriesService } from "./industries.service";
import { IndustriesController } from "./industries.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CountriesService } from "../countries/countries.service";
import { Movie } from "../movies/entities/movie.entity";
import { Bookmark } from "../movies/entities/bookmark.entity";
import { Like } from "../movies/entities/like.entity";
import { Comment } from "../movies/entities/comment.entity";
import { S3Service } from "../s3/s3.service";
import { CountriesModule } from "../countries/countries.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    AuthModule,
    CountriesModule,
    TypeOrmModule.forFeature([Movie, Bookmark, Like, Comment]),
  ],
  controllers: [IndustriesController],
  providers: [IndustriesService, CountriesService, S3Service],
  exports: [TypeOrmModule, CountriesModule, AuthModule],
})
export class IndustriesModule {}
