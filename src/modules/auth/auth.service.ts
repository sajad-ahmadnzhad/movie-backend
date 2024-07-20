import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  forwardRef,
} from "@nestjs/common";
import { SignupUserDto } from "./dto/signupUser.dto";
import { AuthMessages } from "../../common/enums/authMessages.enum";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { RefreshToken, SigninUser, SignupUser } from "./auth.interface";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { RedisCache } from "cache-manager-redis-yet";
import { SigninUserDto } from "./dto/signinUser.dot";
import { ForgotPasswordDto } from "./dto/forgotPassword.dto";
import { randomBytes } from "crypto";
import { MailerService } from "@nestjs-modules/mailer";
import { ResetPasswordDto } from "./dto/resetPassword.dto";
import { SendVerifyEmailDto } from "./dto/sendVerifyEmail.dto";
import { ConfigService } from "@nestjs/config";
import { hashData } from "../../common/utils/functions.util";
import { Cron, CronExpression } from "@nestjs/schedule";
import { User } from "./entities/user.entity";
import { LessThan, LessThanOrEqual, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { BanUser } from "./entities/banUser.entity";
import { Token } from "./entities/token.entity";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private readonly redisCache: RedisCache,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(BanUser)
    private readonly banUserRepository: Repository<BanUser>,
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
    @Inject(forwardRef(() => MailerService))
    private readonly mailerService: MailerService,
    @Inject(forwardRef(() => ConfigService))
    private readonly configService: ConfigService
  ) {}

  private generateToken(
    payload: object,
    expireTime: number | string,
    secretKey: string
  ) {
    return this.jwtService.sign(payload, {
      expiresIn: expireTime,
      secret: secretKey,
    });
  }

  private async deleteExpiredTokens(): Promise<void> {
    await this.tokenRepository.delete({ createdAt: LessThan(new Date()) });
  }

  async signupUser(dto: SignupUserDto): Promise<SignupUser> {
    const { username, email } = dto;

    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });

    if (existingUser) {
      throw new ConflictException(AuthMessages.AlreadyRegistered);
    }

    const isFirstUser = (await this.userRepository.count()) == 0;

    const hashPassword = hashData(dto.password, 12);

    let user = this.userRepository.create({
      ...dto,
      isAdmin: isFirstUser,
      isSuperAdmin: isFirstUser,
      password: hashPassword,
    });

    user = await this.userRepository.save(user);

    const accessToken = this.generateToken(
      { id: user.id },
      process.env.ACCESS_TOKEN_EXPIRE_TIME as string,
      process.env.ACCESS_TOKEN_SECRET as string
    );

    const refreshToken = this.generateToken(
      { id: user.id },
      process.env.REFRESH_TOKEN_EXPIRE_TIME as string,
      process.env.REFRESH_TOKEN_SECRET as string
    );

    await this.redisCache.set(`userRefreshToken:${user.id}`, refreshToken);

    return { success: AuthMessages.SignupUserSuccess, accessToken };
  }

  async signinUser(dto: SigninUserDto): Promise<SigninUser> {
    const { identifier, password } = dto;

    const user = await this.userRepository.findOne({
      where: [{ email: identifier }, { username: identifier }],
      select: { password: true, email: true, id: true },
    });

    if (!user) {
      throw new NotFoundException(AuthMessages.NotFoundUser);
    }

    const isBanUser = !!(await this.banUserRepository.findOneBy({
      email: user.email,
    }));

    if (isBanUser) {
      throw new ForbiddenException(AuthMessages.BannedAccount);
    }

    const comparePassword = bcrypt.compareSync(password, user.password);

    if (!comparePassword) {
      throw new ForbiddenException(AuthMessages.InvalidPassword);
    }
    const accessToken = this.generateToken(
      { id: user.id },
      this.configService.get<string>("ACCESS_TOKEN_EXPIRE_TIME") as string,
      this.configService.get<string>("ACCESS_TOKEN_SECRET") as string
    );

    const refreshToken = this.generateToken(
      { id: user.id },
      this.configService.get<string>("REFRESH_TOKEN_EXPIRE_TIME") as string,
      this.configService.get<string>("REFRESH_TOKEN_SECRET") as string
    );

    await this.redisCache.set(`userRefreshToken:${user.id}`, refreshToken);

    return { success: AuthMessages.SigninUserSuccess, accessToken };
  }

  async refreshToken(accessToken: string): Promise<RefreshToken> {
    const decodeToken = this.jwtService.decode<{ id: number }>(accessToken);

    if (!decodeToken) {
      throw new BadRequestException(AuthMessages.InvalidAccessToken);
    }

    const refreshToken = await this.redisCache.get<string>(
      `userRefreshToken:${decodeToken.id}`
    );

    if (!refreshToken) {
      throw new NotFoundException(AuthMessages.NotFoundRefreshToken);
    }

    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>("REFRESH_TOKEN_SECRET"),
      });
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }

    const newAccessToken = this.generateToken(
      { id: decodeToken.id },
      this.configService.get<string>("ACCESS_TOKEN_EXPIRE_TIME") as string,
      this.configService.get<string>("ACCESS_TOKEN_SECRET") as string
    );

    return {
      newAccessToken,
      success: AuthMessages.RefreshTokenSuccess,
    };
  }

  async signout(accessToken: string): Promise<string> {
    const decodeToken = this.jwtService.decode<{ id: number }>(accessToken);

    if (!decodeToken) {
      throw new BadRequestException(AuthMessages.InvalidAccessToken);
    }

    await this.redisCache.del(`userRefreshToken:${decodeToken.id}`);

    return AuthMessages.SignoutSuccess;
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const existingUser = await this.userRepository.findOneBy({
      email: dto.email,
    });

    if (!existingUser) {
      throw new NotFoundException(AuthMessages.NotFoundUser);
    }

    await this.deleteExpiredTokens();

    const existingToken = await this.tokenRepository
      .createQueryBuilder("token")
      .leftJoinAndSelect("token.user", "user")
      .andWhere("user.email = :email", { email: dto.email })
      .getOne();

    if (existingToken) {
      throw new ConflictException(AuthMessages.AlreadySendMail);
    }

    const token = this.tokenRepository.create({
      user: existingUser,
      token: randomBytes(32).toString("hex"),
    });

    const BASE_URL = this.configService.get<string>("BASE_URL");

    const mailOptions = {
      from: this.configService.get<string>("GMAIL_USER"),
      to: existingUser.email,
      subject: "reset your password",
      html: `<p>Link to reset your password:</p>
      <h1>Click on the link below to reset your password</h1>
      <h2>${BASE_URL}/api/v1/auth/${existingUser.id}/reset-password/${token.token}</h2>
       `,
    };

    setImmediate(async () => {
      try {
        await this.mailerService.sendMail(mailOptions);
        await this.tokenRepository.save(token);
      } catch (error: any) {
        await this.tokenRepository.delete({ id: token.id });
        throw new InternalServerErrorException(error.message);
      }
    });

    return AuthMessages.SendedResetPassword;
  }

  async resetPassword(dto: ResetPasswordDto, userId: number, token: string) {
    await this.deleteExpiredTokens();

    const existingToken = await this.tokenRepository.findOneBy({ token });

    if (!existingToken) {
      throw new NotFoundException(AuthMessages.NotFoundToken);
    }

    const hashPassword = hashData(dto.password, 12);

    await this.userRepository.update(
      { id: userId },
      { password: hashPassword }
    );

    await this.tokenRepository.delete({ token });
    return AuthMessages.ResetPasswordSuccess;
  }

  async sendVerifyEmail(dto: SendVerifyEmailDto) {
    const user = await this.userRepository.findOneBy({ email: dto.email });

    if (!user) {
      throw new NotFoundException(AuthMessages.NotFoundUser);
    }

    if (user.isVerifyEmail) {
      throw new ConflictException(AuthMessages.AlreadyVerifyEmail);
    }

    await this.deleteExpiredTokens();

    const existingToken = await this.tokenRepository
      .createQueryBuilder("token")
      .leftJoinAndSelect("token.user", "user")
      .where("user.email = :email", { email: dto.email })
      .getOne();

    if (existingToken) {
      throw new ConflictException(AuthMessages.AlreadySendMail);
    }

    const token = this.tokenRepository.create({
      user,
      token: randomBytes(32).toString("hex"),
    });

    const BASE_URL = this.configService.get<string>("BASE_URL");

    const url = `${BASE_URL}/api/v1/auth/${user.id}/verify/${token.token}`;

    const mailOptions = {
      from: process.env.GMAIL_USER as string,
      to: user.email,
      subject: "Email confirmation",
      html: `<p>Click on the link below to confirm the email:</p>
       <h1>${url}</h1>`,
    };

    setImmediate(async () => {
      try {
        await this.mailerService.sendMail(mailOptions);
        await this.tokenRepository.save(token);
      } catch (error: any) {
        throw new InternalServerErrorException(error.message);
      }
    });

    return AuthMessages.SendVerifyEmailSuccess;
  }

  async verifyEmail(userId: number, token: string) {
    const existingToken = await this.tokenRepository.findOneBy({ token });

    if (!existingToken) {
      throw new NotFoundException(AuthMessages.NotFoundToken);
    }

    const user = await this.userRepository.findOneBy({ id: userId });

    if (!user) {
      throw new NotFoundException(AuthMessages.NotFoundUser);
    }

    if (user.isVerifyEmail) {
      throw new ConflictException(AuthMessages.AlreadyVerifyEmail);
    }

    await this.userRepository.update({ id: userId }, { isVerifyEmail: true });

    await this.tokenRepository.remove(existingToken);

    return AuthMessages.VerifiedEmailSuccess;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async removeUnverifiedUsers() {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    await this.userRepository.delete({
      isVerifyEmail: false,
      createdAt: LessThanOrEqual(oneMonthAgo),
    });
  }
}
