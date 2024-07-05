import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/User.entity";
import { BanUser } from "./entities/banUser.entity";
import { Token } from "./entities/token.entity";
import { MailModule } from "../mail/mail.module";

@Module({
  imports: [
    JwtModule.register({ global: true }),
    ScheduleModule.forRoot(),
    MailModule,
    TypeOrmModule.forFeature([User, BanUser, Token]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
