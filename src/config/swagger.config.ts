import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { SecuritySchemeObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

export const swaggerConfigInit = (app: INestApplication) => {
  const swaggerConfig = new DocumentBuilder()
    .setTitle("Movies backend")
    .setDescription("Movie introduction website")
    .setVersion("0.0.1")
    .addServer("/api/v1")
    .addCookieAuth("accessToken", swaggerAuthConfig(), "authorization")
    .build();

  if (process.env.NODE_ENV !== "prod") {
    const document = SwaggerModule.createDocument(app, swaggerConfig, {
      ignoreGlobalPrefix: true,
    });
    SwaggerModule.setup("api/v1/docs", app, document, {
      jsonDocumentUrl: "swagger/json",
    });
  }
};

function swaggerAuthConfig(): SecuritySchemeObject {
  return {
    scheme: "cookie",
    type: "http",
    in: "header",
    bearerFormat: "JWT",
  };
}
