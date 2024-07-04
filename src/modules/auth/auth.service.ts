import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User as UserMongoose } from "../users/schemas/User.schema";
import { Document, Model, ObjectId } from "mongoose";
import { SignupUserDto } from "./dto/signupUser.dto";
import { AuthMessages } from "../../common/enum/authMessages.enum";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import { RefreshToken, SigninUser, SignupUser } from "./auth.interface";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { RedisCache } from "cache-manager-redis-yet";
import { SigninUserDto } from "./dto/signinUser.dot";
import { ForgotPasswordDto } from "./dto/forgotPassword.dto";
import { Token } from "../users/schemas/Token.schema";
import { randomBytes } from "crypto";
import { MailerService } from "@nestjs-modules/mailer";
import { ResetPasswordDto } from "./dto/resetPassword.dto";
import { SendVerifyEmailDto } from "./dto/sendVerifyEmail.dto";
import { ConfigService } from "@nestjs/config";
import { hashData } from "../../common/utils/functions.util";
import { BanUser } from "../users/schemas/BanUser.schema";
import { Cron, CronExpression } from "@nestjs/schedule";
import { User } from "./entities/User.entity";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserMongoose.name)
    private readonly userModel: Model<UserMongoose>,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER) private readonly redisCache: RedisCache,
    @InjectModel(Token.name) private readonly tokenModel: Model<Token>,
    @InjectModel(BanUser.name) private readonly banUserModel: Model<BanUser>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly mailerService: MailerService,
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

  async signupUser(dto: SignupUserDto): Promise<SignupUser> {
    const { username, email } = dto;

    const existingUser = await this.userRepository.findOne({
      where: [{ username }, { email }],
    });

    if (existingUser) {
      throw new ConflictException(AuthMessages.AlreadyRegistered);
    }

    //TODO: Change to mysql
    const isBanUser = !!(await this.banUserModel.findOne({ email: dto.email }));

    if (isBanUser) {
      throw new ForbiddenException(AuthMessages.BannedAccount);
    }

    const isFirstUser = (await this.userRepository.count()) == 0;

    const hashPassword = hashData(dto.password, 12);

    const user = this.userRepository.create({
      ...dto,
      isAdmin: isFirstUser,
      isSuperAdmin: isFirstUser,
      password: hashPassword,
    });

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

    const user: (User & { _id: ObjectId }) | null = await this.userModel
      .findOne({
        $or: [{ email: identifier }, { username: identifier }],
      })
      .select("password email");

    if (!user) {
      throw new NotFoundException(AuthMessages.NotFoundUser);
    }

    const isBanUser = !!(await this.banUserModel.findOne({
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
      { id: user._id.toString() },
      this.configService.get<string>("ACCESS_TOKEN_EXPIRE_TIME") as string,
      this.configService.get<string>("ACCESS_TOKEN_SECRET") as string
    );

    const refreshToken = this.generateToken(
      { id: user._id.toString() },
      this.configService.get<string>("REFRESH_TOKEN_EXPIRE_TIME") as string,
      this.configService.get<string>("REFRESH_TOKEN_SECRET") as string
    );

    await this.redisCache.set(user._id.toString(), refreshToken);

    return { success: AuthMessages.SigninUserSuccess, accessToken };
  }

  async refreshToken(accessToken: string): Promise<RefreshToken> {
    const decodeToken = this.jwtService.decode<{ id: string }>(accessToken);

    if (!decodeToken) {
      throw new BadRequestException(AuthMessages.InvalidAccessToken);
    }

    const refreshToken = await this.redisCache.get<string>(decodeToken.id);

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
    const decodeToken = this.jwtService.decode<{ id: string }>(accessToken);

    if (!decodeToken) {
      throw new BadRequestException(AuthMessages.InvalidAccessToken);
    }

    await this.redisCache.del(decodeToken.id);

    return AuthMessages.SignoutSuccess;
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const existingUser = await this.userModel.findOne({ email: dto.email });

    if (!existingUser) {
      throw new NotFoundException(AuthMessages.NotFoundUser);
    }

    const existingToken = await this.tokenModel.findOne({
      userId: existingUser._id,
    });

    if (existingToken) {
      throw new ConflictException(AuthMessages.AlreadySendMail);
    }

    const token = await this.tokenModel.create({
      userId: existingUser._id,
      token: randomBytes(32).toString("hex"),
    });

    const mailOptions = {
      from: this.configService.get<string>("GMAIL_USER"),
      to: existingUser.email,
      subject: "reset your password",
      html: `<p>Link to reset your password:</p>
      <h1>Click on the link below to reset your password</h1>
      <h2>${this.configService.get<string>("BASE_URL")}/auth/${existingUser._id}/reset-password/${token.token}</h2>
       `,
    };

    try {
      await this.mailerService.sendMail(mailOptions);
    } catch (error) {
      await token.deleteOne();
      throw error;
    }

    return AuthMessages.SendedResetPassword;
  }

  async resetPassword(dto: ResetPasswordDto, userId: string, token: string) {
    const existingToken = await this.tokenModel.findOne({ token });

    if (!existingToken) {
      throw new NotFoundException(AuthMessages.NotFoundToken);
    }

    const hashPassword = hashData(dto.password, 12);

    await this.userModel.findOneAndUpdate(
      { _id: userId },
      { password: hashPassword }
    );

    await existingToken.deleteOne();

    return AuthMessages.ResetPasswordSuccess;
  }

  async sendVerifyEmail(dto: SendVerifyEmailDto) {
    const user = await this.userModel.findOne({ email: dto.email });

    if (!user) {
      throw new NotFoundException(AuthMessages.NotFoundUser);
    }

    if (user.isVerifyEmail) {
      throw new ConflictException(AuthMessages.AlreadyVerifyEmail);
    }

    const existingToken = await this.tokenModel.findOne({
      userId: user._id,
    });

    if (existingToken) {
      throw new ConflictException(AuthMessages.AlreadySendMail);
    }

    const token = await this.tokenModel.create({
      userId: user._id,
      token: randomBytes(32).toString("hex"),
    });

    const url = `${this.configService.get<string>("BASE_URL")}/auth/${user._id}/verify/${token.token}`;

    const mailOptions = {
      from: process.env.GMAIL_USER as string,
      to: user.email,
      subject: "Email confirmation",
      html: `<p>Click on the link below to confirm the email:</p>
       <h1>${url}</h1>`,
    };

    try {
      await this.mailerService.sendMail(mailOptions);
    } catch (error: any) {
      await token.deleteOne();
      throw new InternalServerErrorException(error.message);
    }

    return AuthMessages.SendVerifyEmailSuccess;
  }

  async verifyEmail(userId: string, token: string) {
    const existingToken = await this.tokenModel.findOne({ token });

    if (!existingToken) {
      throw new NotFoundException(AuthMessages.NotFoundToken);
    }

    const user = await this.userModel.findById(userId);

    if (!user) {
      throw new NotFoundException(AuthMessages.NotFoundUser);
    }

    if (user.isVerifyEmail) {
      throw new ConflictException(AuthMessages.AlreadyVerifyEmail);
    }

    await user.updateOne({
      isVerifyEmail: true,
    });

    await existingToken.deleteOne();

    return AuthMessages.verifiedEmailSuccess;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  private async removeUnverifiedUsers() {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    await this.userModel
      .deleteMany({
        isVerifyEmail: false,
        createdAt: { $lt: oneMonthAgo },
      })
      .exec();
  }
}
