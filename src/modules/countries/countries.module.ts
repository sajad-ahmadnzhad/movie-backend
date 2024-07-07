import { Module } from "@nestjs/common";
import { CountriesService } from "./countries.service";
import { CountriesController } from "./countries.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BanUser } from "../auth/entities/banUser.entity";
import { User } from "../auth/entities/User.entity";
import { Country } from "./entities/country.entity";
import { Industry } from "../industries/entities/industry.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User, BanUser, Country, Industry])],
  controllers: [CountriesController],
  providers: [CountriesService],
})
export class CountriesModule {}
