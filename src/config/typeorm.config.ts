import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";
import { User } from '../modules/auth/entities/User.entity';

export const typeormConfig = (): TypeOrmModuleAsyncOptions => {
  return {
    inject: [ConfigService],
    useFactory(configService: ConfigService) {
      return {
        type: "mysql",
        host: configService.get<string>("DB_HOST"),
        port: Number(configService.get<string>("DB_PORT")),
        username: configService.get<string>("DB_USERNAME"),
        password: configService.get<string>("DB_PASSWORD"),
        database: configService.get<string>("DB_NAME"),
        entities: [User],
        synchronize: !!Number(configService.get<string>("DB_SYNCHRONIZE")),
      };
    },
  };
};
