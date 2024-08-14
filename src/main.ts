import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app/app.module";
import { Logger, ValidationPipe, VersioningType } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestExpressApplication } from "@nestjs/platform-express";
import { swaggerConfigInit } from "./config/swagger.config";
import { corsConfig } from "./config/cors.config";
import * as express from "express";
import { IoAdapter } from "@nestjs/platform-socket.io";

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const PORT = configService.get<string>("PORT") || 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.setGlobalPrefix("api");

  //* Config and Init Swagger
  swaggerConfigInit(app);

  //* Use static files
  app.useStaticAssets("public");

  //* Use websocket
  app.useWebSocketAdapter(new IoAdapter(app));

  //* Config cors
  corsConfig(app);

  //* Enable version
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: "1",
  });

  await app.listen(PORT, "0.0.0.0");
  logger.log(`Application running on port ${PORT}`);
}
bootstrap();
