import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import { Model } from "mongoose";
import { User } from "../../users/schemas/User.schema";
import { BanUser } from "src/modules/users/schemas/BanUser.schema";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(BanUser.name) private readonly banUser: Model<BanUser>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest() as Request;

    const { accessToken } = req.cookies;

    if (!accessToken) {
      throw new ForbiddenException("This path is protected !!");
    }

    let jwtPayload: null | { id: string } = null;

    try {
      jwtPayload = this.jwtService.verify<{ id: string }>(accessToken, {
        secret: this.configService.get<string>("ACCESS_TOKEN_SECRET"),
      });
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }

    const user = await this.userModel.findById(jwtPayload?.id);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (!user.isVerifyEmail) {
      throw new ForbiddenException(
        "Verify your email before accessing this site"
      );
    }

    const isBanUser = !!(await this.banUser.findOne({ email: user.email }));

    if (!isBanUser) {
      throw new ForbiddenException("Your account is banned by admins");
    }

    req.user = user;

    return true;
  }
}
