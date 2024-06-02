import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { MongooseModule } from "@nestjs/mongoose";
import { ConfigModule } from "@nestjs/config";
import { CacheModule } from "@nestjs/cache-manager";
import { APP_GUARD, APP_PIPE } from "@nestjs/core";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { UsersModule } from "../users/users.module";
import { MailModule } from "../mail/mail.module";
import helmet from "helmet";
import * as cookieParser from "cookie-parser";
import { cacheConfig } from "../../config/cache.config";
import { mongooseConfig } from "../../config/mongoose.config";
import { CountriesModule } from "../countries/countries.module";

@Module({
  imports: [
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 50 }]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.cwd() + `/.env.${process.env.NODE_ENV}`,
    }),
    AuthModule,
    MongooseModule.forRootAsync(mongooseConfig()),
    CacheModule.registerAsync(cacheConfig()),
    UsersModule,
    MailModule,
    CountriesModule
  ],
  providers: [
    { provide: APP_PIPE, useValue: new ValidationPipe({ whitelist: true }) },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(helmet(), cookieParser()).forRoutes("*");
  }
}
