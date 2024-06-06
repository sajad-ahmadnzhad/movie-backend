import { Module } from "@nestjs/common";
import { IndustriesService } from "./industries.service";
import { IndustriesController } from "./industries.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Industry, IndustrySchema } from "./schemas/Industry.schema";
import { User, UserSchema } from "../users/schemas/User.schema";
import { Country, CountrySchema } from "../countries/schemas/Country.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Industry.name, schema: IndustrySchema },
      { name: User.name, schema: UserSchema },
      { name: Country.name, schema: CountrySchema },
    ]),
  ],
  controllers: [IndustriesController],
  providers: [IndustriesService],
})
export class IndustriesModule {}
