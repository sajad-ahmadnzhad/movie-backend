import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";

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
        synchronize: !!Number(configService.get<string>("DB_SYNCHRONIZE")),
        autoLoadEntities: true,
      };
    },
  };
};
