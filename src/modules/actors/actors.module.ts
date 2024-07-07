import { Module } from "@nestjs/common";
import { ActorsService } from "./actors.service";
import { ActorsController } from "./actors.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Industry } from "../industries/entities/industry.entity";
import { Country } from "../countries/entities/country.entity";
import { Actor } from "./entities/actor.entity";
import { User } from "../auth/entities/User.entity";
import { BanUser } from "../auth/entities/banUser.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Actor, Country, Industry, BanUser]),
  ],
  controllers: [ActorsController],
  providers: [ActorsService],
})
export class ActorsModule {}
