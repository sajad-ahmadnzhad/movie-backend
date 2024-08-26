import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Req,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SignupUserDto } from "./dto/signupUser.dto";
import { Request } from "express";
import { SigninUserDto } from "./dto/signinUser.dot";
import { ForgotPasswordDto } from "./dto/forgotPassword.dto";
import { ResetPasswordDto } from "./dto/resetPassword.dto";
import { SendVerifyEmailDto } from "./dto/sendVerifyEmail.dto";
import { Throttle } from "@nestjs/throttler";
import { ApiTags } from "@nestjs/swagger";
import {
  SignInUserDecorator,
  RefreshTokenDecorator,
  SignoutUserDecorator,
  ForgotPasswordDecorator,
  ResetPasswordDecorator,
  SendVerifyEmailDecorator,
  VerifyEmailDecorator,
  SignUpUserDecorator,
  GoogleAuthDecorator,
  GoogleRedirectDecorator,
} from "../../common/decorators/auth.decorator";
import { GoogleOAuthUser, SigninUser, SignupUser } from "./auth.interface";
import { extractToken } from "../../common/utils/functions.util";
import { SignoutDto } from "./dto/signout.dto";

@Throttle({ default: { ttl: 60_000, limit: 5 } })
@ApiTags("auth")
@Controller({
  path: "auth",
  version: "1",
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post("signup")
  @SignUpUserDecorator
  signup(@Body() body: SignupUserDto): Promise<SignupUser> {
    return this.authService.signupUser(body);
  }

  @Post("signin")
  @SignInUserDecorator
  signin(@Body() body: SigninUserDto): Promise<SigninUser> {
    return this.authService.signinUser(body);
  }

  @Post("refresh")
  @RefreshTokenDecorator
  refreshToken(@Req() req: Request) {
    const refreshToken = extractToken(req);
    return this.authService.refreshToken(refreshToken);
  }

  @Get("signout")
  @SignoutUserDecorator
  async signout(@Body() body: SignoutDto): Promise<{ message: string }> {
    const { refreshToken } = body;

    const success = await this.authService.signout(refreshToken);
    return { message: success };
  }

  @Get("google/login")
  @GoogleAuthDecorator
  googleAuth() {}

  @Get("google/redirect")
  @GoogleRedirectDecorator
  googleRedirect(@Req() req: Request) {
    return this.authService.googleAuth(req.user as GoogleOAuthUser);
  }

  @Post("forgot-password")
  @ForgotPasswordDecorator
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    const success = await this.authService.forgotPassword(body);

    return { message: success };
  }

  @Post(":userId/reset-password/:token")
  @ResetPasswordDecorator
  async resetPassword(
    @Body() body: ResetPasswordDto,
    @Param("userId", ParseIntPipe) userId: number,
    @Param("token") token: string
  ) {
    const success = await this.authService.resetPassword(body, userId, token);

    return { message: success };
  }

  @Post("verify-email")
  @SendVerifyEmailDecorator
  async sendVerifyMail(@Body() body: SendVerifyEmailDto) {
    const success = await this.authService.sendVerifyEmail(body);

    return { message: success };
  }

  @Get(":userId/verify/:token")
  @VerifyEmailDecorator
  async verifyEmail(
    @Param("userId", ParseIntPipe) userId: number,
    @Param("token") token: string
  ) {
    const success = await this.authService.verifyEmail(userId, token);

    return { message: success };
  }
}
