import { MongooseModuleAsyncOptions } from "@nestjs/mongoose";

export const mongooseConfig = (): MongooseModuleAsyncOptions => {
  return {
    useFactory: () => ({
      uri: process.env.MONGODB_URI,
    }),
  };
};
