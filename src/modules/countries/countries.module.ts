import { Module } from "@nestjs/common";
import { CountriesService } from "./countries.service";
import { CountriesController } from "./countries.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Country, countrySchema } from "./models/Country.model";
import { User, UserSchema } from "../users/models/User.model";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Country.name, schema: countrySchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [CountriesController],
  providers: [CountriesService],
})
export class CountriesModule {}
