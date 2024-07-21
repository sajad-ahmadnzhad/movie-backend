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
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Request } from "express";
import { User } from "../../modules/auth/entities/user.entity";
import { Repository } from "typeorm";
import { BanUser } from "../../modules/auth/entities/banUser.entity";

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => JwtService))
    private readonly jwtService: JwtService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(BanUser)
    private readonly banUserRepository: Repository<BanUser>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest() as Request;

    const { accessToken } = req.cookies;

    if (!accessToken) return false

    let jwtPayload: null | { id: number } = null;

    try {
      jwtPayload = this.jwtService.verify<{ id: number }>(accessToken, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });
    } catch (error) {
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
