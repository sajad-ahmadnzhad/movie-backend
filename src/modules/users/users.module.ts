import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./schemas/User.schema";
import { BanUser, BanUserSchema } from "./schemas/BanUser.schema";
import { Bookmark, BookmarkSchema } from "../movies/schemas/Bookmark.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: BanUser.name, schema: BanUserSchema },
      { name: Bookmark.name, schema: BookmarkSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
