import { Module } from "@nestjs/common";
import { CountriesService } from "./countries.service";
import { CountriesController } from "./countries.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Country, CountrySchema } from "./schemas/Country.schema";
import { User, UserSchema } from "../users/schemas/User.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Country.name, schema: CountrySchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [CountriesController],
  providers: [CountriesService],
})
export class CountriesModule {}
