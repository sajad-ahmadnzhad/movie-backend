import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BanUser } from "../auth/entities/banUser.entity";
import { User } from "../auth/entities/user.entity";
import { Bookmark } from "../movies/entities/bookmark.entity";
import { S3Service } from "../s3/s3.service";
import { AwsSdkModule } from "nest-aws-sdk";
import { S3 } from "aws-sdk";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, BanUser, Bookmark]),
    AwsSdkModule.forFeatures([S3]),
  ],
  controllers: [UsersController],
  providers: [UsersService, S3Service],
})
export class UsersModule {}
