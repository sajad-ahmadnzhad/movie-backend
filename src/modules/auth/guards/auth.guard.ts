import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { User } from "../entities/user.entity";
import { BanUser } from "../entities/banUser.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => JwtService))
    private jwtService: JwtService,
    @Inject(forwardRef(() => ConfigService))
    private configService: ConfigService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(BanUser)
    private readonly banUserRepository: Repository<BanUser>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest() as Request;

    const { accessToken } = req.cookies;

    if (!accessToken) {
      throw new ForbiddenException("This path is protected !!");
    }

    let jwtPayload: null | { id: number } = null;

    try {
      jwtPayload = this.jwtService.verify<{ id: number }>(accessToken, {
        secret: this.configService.get<string>("ACCESS_TOKEN_SECRET"),
      });
    } catch (error: any) {
      throw new InternalServerErrorException(error.message);
    }

    const user = await this.userRepository.findOneBy({ id: jwtPayload?.id });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (!user.isVerifyEmail) {
      throw new ForbiddenException(
        "Verify your email before accessing this site"
      );
    }

    const isBanUser = !!(await this.banUserRepository.findOneBy({
      email: user.email,
    }));

    if (isBanUser) {
      throw new ForbiddenException("Your account is banned by admins");
    }

    req.user = user;

    return true;
  }
}
