import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Bookmark } from "../movies/entities/bookmark.entity";
import { S3Service } from "../s3/s3.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Bookmark]),
  ],
  controllers: [UsersController],
  providers: [UsersService, S3Service],
})
export class UsersModule {}
