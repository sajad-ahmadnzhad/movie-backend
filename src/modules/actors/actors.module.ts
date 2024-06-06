import { Module } from "@nestjs/common";
import { ActorsService } from "./actors.service";
import { ActorsController } from "./actors.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Actor, ActorSchema } from "./schemas/Actor.schema";
import { Country, CountrySchema } from "../countries/schemas/Country.schema";
import { User, UserSchema } from "../users/schemas/User.schema";
import {
  Industry,
  IndustrySchema,
} from "../industries/schemas/Industry.schema";
import { BanUser, BanUserSchema } from "../users/schemas/BanUser.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Actor.name, schema: ActorSchema },
      { name: Country.name, schema: CountrySchema },
      { name: User.name, schema: UserSchema },
      { name: Industry.name, schema: IndustrySchema },
      { name: BanUser.name, schema: BanUserSchema },
    ]),
  ],
  controllers: [ActorsController],
  providers: [ActorsService],
})
export class ActorsModule {}
