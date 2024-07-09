import { Module } from "@nestjs/common";
import { IndustriesService } from "./industries.service";
import { IndustriesController } from "./industries.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BanUser } from "../auth/entities/banUser.entity";
import { Country } from "../countries/entities/country.entity";
import { User } from "../auth/entities/User.entity";
import { Industry } from "./entities/industry.entity";
import { CountriesService } from "../countries/countries.service";
import { Movie } from "../movies/entities/movie.entity";
import { Bookmark } from "../movies/entities/Bookmark.entity";
import { Like } from "../movies/entities/like.entity";
import { Comment } from "../movies/entities/comment.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Country,
      BanUser,
      Industry,
      Movie,
      Bookmark,
      Like,
      Comment,
    ]),
  ],
  controllers: [IndustriesController],
  providers: [IndustriesService, CountriesService],
})
export class IndustriesModule {}
