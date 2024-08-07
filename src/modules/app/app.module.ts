import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
  ValidationPipe,
} from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { CacheModule } from "@nestjs/cache-manager";
import { APP_GUARD, APP_PIPE } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { UsersModule } from "../users/users.module";
import { MailModule } from "../mail/mail.module";
import helmet from "helmet";
import * as cookieParser from "cookie-parser";
import { cacheConfig } from "../../config/cache.config";
import { CountriesModule } from "../countries/countries.module";
import { IndustriesModule } from "../industries/industries.module";
import { ActorsModule } from "../actors/actors.module";
import { GenresModule } from "../genres/genres.module";
import { MoviesModule } from "../movies/movies.module";
import { LoggerMiddleware } from "../../common/middlewares/application.log";
import { TypeOrmModule } from "@nestjs/typeorm";
import { typeormConfig } from "../../config/typeorm.config";
import { BasicAuthMiddleware } from "../../common/middlewares/basicAuth.middleware";
import { S3Module } from "../s3/s3.module";
import { AwsSdkModule } from "nest-aws-sdk";
import { awsSdkConfig } from "../../config/awsSdk.config";

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 50 }]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.cwd() + `/.env.${process.env.NODE_ENV}`,
    }),
    AuthModule,
    CacheModule.registerAsync(cacheConfig()),
    TypeOrmModule.forRootAsync(typeormConfig()),
    AwsSdkModule.forRoot(awsSdkConfig()),
    UsersModule,
    MailModule,
    CountriesModule,
    IndustriesModule,
    ActorsModule,
    GenresModule,
    MoviesModule,
    S3Module,
  ],
  providers: [
    { provide: APP_PIPE, useValue: new ValidationPipe({ whitelist: true }) },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(helmet(), cookieParser(), LoggerMiddleware)
      .forRoutes({ path: "*", method: RequestMethod.ALL })
      .apply(BasicAuthMiddleware)
      .forRoutes({ path: "swagger", method: RequestMethod.GET });
  }
}
