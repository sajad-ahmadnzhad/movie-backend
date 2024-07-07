import { Module } from "@nestjs/common";
import { GenresService } from "./genres.service";
import { GenresController } from "./genres.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../auth/entities/User.entity";
import { Genre } from "./entities/genre.entity";
import { BanUser } from "../auth/entities/banUser.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User, Genre, BanUser])],
  controllers: [GenresController],
  providers: [GenresService],
})
export class GenresModule {}
