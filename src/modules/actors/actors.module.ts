import { Module } from "@nestjs/common";
import { ActorsService } from "./actors.service";
import { ActorsController } from "./actors.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Actor } from "./entities/actor.entity";
import { IndustriesService } from "../industries/industries.service";
import { CountriesService } from "../countries/countries.service";
import { S3Service } from "../s3/s3.service";
import { CountriesModule } from "../countries/countries.module";

@Module({
  imports: [CountriesModule, TypeOrmModule.forFeature([Actor])],
  controllers: [ActorsController],
  providers: [ActorsService, IndustriesService, CountriesService, S3Service],
})
export class ActorsModule {}
