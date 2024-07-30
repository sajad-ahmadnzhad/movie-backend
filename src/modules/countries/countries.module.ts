import { Module } from "@nestjs/common";
import { CountriesService } from "./countries.service";
import { CountriesController } from "./countries.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BanUser } from "../auth/entities/banUser.entity";
import { User } from "../auth/entities/user.entity";
import { Country } from "./entities/country.entity";
import { Industry } from "../industries/entities/industry.entity";
import { S3Service } from "../s3/s3.service";
import { S3 } from "aws-sdk";
import { AwsSdkModule } from "nest-aws-sdk";

@Module({
  imports: [
    TypeOrmModule.forFeature([User, BanUser, Country, Industry]),
    AwsSdkModule.forFeatures([S3]),
  ],
  controllers: [CountriesController],
  providers: [CountriesService, S3Service],
})
export class CountriesModule {}
