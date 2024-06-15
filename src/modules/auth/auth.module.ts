import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "../users/schemas/User.schema";
import { JwtModule } from "@nestjs/jwt";
import { Token, TokenSchema } from "../users/schemas/Token.schema";
import { MailModule } from "../mail/mail.module";
import { BanUser, BanUserSchema } from "../users/schemas/BanUser.schema";
import { ScheduleModule } from "@nestjs/schedule";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Token.name, schema: TokenSchema },
      { name: BanUser.name, schema: BanUserSchema },
    ]),
    JwtModule.register({ global: true }),
    ScheduleModule.forRoot(),
    MailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
