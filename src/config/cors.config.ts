import { INestApplication } from "@nestjs/common";

export const corsConfig = (app: INestApplication) => {
  const ALLOWED_ORIGINS: string[] =
    JSON.parse(process.env.ALLOWED_ORIGINS as string) || [];

  app.enableCors({
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true,
  });
};
