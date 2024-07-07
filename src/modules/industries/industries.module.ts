import { Module } from "@nestjs/common";
import { IndustriesService } from "./industries.service";
import { IndustriesController } from "./industries.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BanUser } from "../auth/entities/banUser.entity";
import { Country } from "../countries/entities/country.entity";
import { User } from "../auth/entities/User.entity";
import { Industry } from "./entities/industry.entity";

@Module({
  imports: [TypeOrmModule.forFeature([User, Country, BanUser , Industry])],
  controllers: [IndustriesController],
  providers: [IndustriesService],
})
export class IndustriesModule {}
