import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { User as MongooseUser, UserSchema } from "../users/schemas/User.schema";
import { JwtModule } from "@nestjs/jwt";
import { Token, TokenSchema } from "../users/schemas/Token.schema";
import { MailModule } from "../mail/mail.module";
import { BanUser, BanUserSchema } from "../users/schemas/BanUser.schema";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from "./entities/User.entity";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MongooseUser.name, schema: UserSchema },
      { name: Token.name, schema: TokenSchema },
      { name: BanUser.name, schema: BanUserSchema },
    ]),
    JwtModule.register({ global: true }),
    ScheduleModule.forRoot(),
    MailModule,
    TypeOrmModule.forFeature([User])
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
