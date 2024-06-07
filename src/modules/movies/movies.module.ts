import { Module } from "@nestjs/common";
import { MoviesService } from "./movies.service";
import { MoviesController } from "./movies.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "../users/schemas/User.schema";
import { BanUser, BanUserSchema } from "../users/schemas/BanUser.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: BanUser.name, schema: BanUserSchema },
    ]),
  ],
  controllers: [MoviesController],
  providers: [MoviesService],
})
export class MoviesModule {}
