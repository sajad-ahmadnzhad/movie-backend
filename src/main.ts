import { NestFactory } from "@nestjs/core";
import { AppModule } from "./modules/app/app.module";
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestExpressApplication } from "@nestjs/platform-express";
import { swaggerConfigInit } from "./config/swagger.config";
import { corsConfig } from "./config/cors.config";

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);
  const PORT = configService.get<string>("PORT") || 3000;

  //* Config and Init Swagger
  swaggerConfigInit(app);

  //* Use static files
  app.useStaticAssets("public");

  //* Config cors
  corsConfig(app);

  await app.listen(PORT, "0.0.0.0");
  logger.log(`Application running on port ${PORT}`);
}
bootstrap();
