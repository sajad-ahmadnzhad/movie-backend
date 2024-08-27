import { Module } from "@nestjs/common";
import { CountriesService } from "./countries.service";
import { CountriesController } from "./countries.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Country } from "./entities/country.entity";
import { Industry } from "../industries/entities/industry.entity";
import { S3Service } from "../s3/s3.service";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Country, Industry])],
  controllers: [CountriesController],
  providers: [CountriesService, S3Service],
  exports: [TypeOrmModule, AuthModule],
})
export class CountriesModule {}
