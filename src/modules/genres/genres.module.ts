import { Module } from "@nestjs/common";
import { GenresService } from "./genres.service";
import { GenresController } from "./genres.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Genre } from "./entities/genre.entity";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Genre])],
  controllers: [GenresController],
  providers: [GenresService],
})
export class GenresModule {}
