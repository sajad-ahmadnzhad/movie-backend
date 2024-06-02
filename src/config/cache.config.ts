import { CacheModuleAsyncOptions } from "@nestjs/cache-manager";
import { redisStore } from "cache-manager-redis-yet";

export const cacheConfig = (): CacheModuleAsyncOptions => {
  return {
    isGlobal: true,
    async useFactory() {
      const store = await redisStore({
        socket: {
          host: process.env.REDIS_HOST,
        },
      });

      return { store };
    },
  };
};
