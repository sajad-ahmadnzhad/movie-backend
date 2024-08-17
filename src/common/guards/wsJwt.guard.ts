import {
  CanActivate,
  ExecutionContext,
  forwardRef,
  Inject,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Socket } from "socket.io";
import { User } from "../../modules/auth/entities/user.entity";
import { Repository } from "typeorm";
import { BanUser } from "../../modules/auth/entities/banUser.entity";
import { WsException } from "@nestjs/websockets";

export class WsJwtGuard implements CanActivate {
  constructor(
    @Inject(forwardRef(() => JwtService))
    private readonly jwtServer: JwtService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(BanUser)
    private readonly banUserRepository: Repository<BanUser>
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();

    const { accessToken } = client.handshake.auth;

    if (!accessToken) {
      throw new WsException("AccessToken not provided.");
    }

    let payload: Partial<{ id: number }> = {};

    try {
      payload = this.jwtServer.verify<{ id: number }>(accessToken as string, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });
    } catch (error) {
      throw new WsException(error.message);
    }

    const user = await this.userRepository.findOneBy({ id: payload.id });

    if (!user) {
      throw new WsException("User not found");
    }

    if (!user.isVerifyEmail) {
      throw new WsException("Verify your email before accessing this site");
    }

    const isBanUser = !!(await this.banUserRepository.findOneBy({
      email: user.email,
    }));

    if (isBanUser) {
      throw new WsException("Your account is banned by admins");
    }

    let clientData = context.switchToWs().getData();

    if (typeof clientData !== "object") {
      throw new WsException("The data sent must be an object");
    }

    clientData.user = user;

    return true;
  }
}
