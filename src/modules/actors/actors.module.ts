import { Module } from "@nestjs/common";
import { ActorsService } from "./actors.service";
import { ActorsController } from "./actors.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Actor, ActorSchema } from "./models/Actor.model";
import { Country, CountrySchema } from "../countries/models/Country.model";
import { User, UserSchema } from "../users/models/User.model";
import { Industry, IndustrySchema } from "../industries/models/Industry.model";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Actor.name, schema: ActorSchema },
      { name: Country.name, schema: CountrySchema },
      { name: User.name, schema: UserSchema },
      { name: Industry.name, schema: IndustrySchema },
    ]),
  ],
  controllers: [ActorsController],
  providers: [ActorsService],
})
export class ActorsModule {}
