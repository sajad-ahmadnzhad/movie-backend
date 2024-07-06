import { Module } from "@nestjs/common";
import { GenresService } from "./genres.service";
import { GenresController } from "./genres.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Genre as MongooseGenre, GenreSchema } from "./schemas/Genre.schema";
import { User as MongooseUser, UserSchema } from "../users/schemas/User.schema";
import { BanUser as MongooseBanUser , BanUserSchema } from "../users/schemas/BanUser.schema";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../auth/entities/User.entity";
import { Genre } from "./entities/genre.entity";
import { BanUser } from "../auth/entities/banUser.entity";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MongooseGenre.name, schema: GenreSchema },
      { name: MongooseUser.name, schema: UserSchema },
      { name: MongooseBanUser.name, schema: BanUserSchema },
    ]),
    TypeOrmModule.forFeature([User, Genre, BanUser]),
  ],
  controllers: [GenresController],
  providers: [GenresService],
})
export class GenresModule {}
