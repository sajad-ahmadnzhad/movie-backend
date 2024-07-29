import { Module } from "@nestjs/common";
import { ActorsService } from "./actors.service";
import { ActorsController } from "./actors.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Industry } from "../industries/entities/industry.entity";
import { Country } from "../countries/entities/country.entity";
import { Actor } from "./entities/actor.entity";
import { User } from "../auth/entities/user.entity";
import { BanUser } from "../auth/entities/banUser.entity";
import { IndustriesService } from "../industries/industries.service";
import { CountriesService } from "../countries/countries.service";
import { AwsSdkModule } from "nest-aws-sdk";
import { S3 } from "aws-sdk";
import { S3Service } from "../s3/s3.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Actor, Country, Industry, BanUser]),
    AwsSdkModule.forFeatures([S3]),
  ],
  controllers: [ActorsController],
  providers: [ActorsService, IndustriesService, CountriesService, S3Service],
})
export class ActorsModule {}
