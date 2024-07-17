import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BanUser } from "../auth/entities/banUser.entity";
import { User } from "../auth/entities/user.entity";
import { Bookmark } from "../movies/entities/bookmark.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User, BanUser, Bookmark])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
