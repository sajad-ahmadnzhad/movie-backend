import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { SecuritySchemeObject } from "@nestjs/swagger/dist/interfaces/open-api-spec.interface";

export const swaggerConfigInit = (app: INestApplication) => {
  const swaggerConfig = new DocumentBuilder()
    .setTitle("Movies backend")
    .setDescription("Movie introduction website")
    .setVersion("0.0.1")
    .addServer("/api/v1")
    .addBearerAuth(swaggerAuthConfig(), "Authorization")
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    ignoreGlobalPrefix: true,
  });

  SwaggerModule.setup("swagger", app, document, {
    jsonDocumentUrl: "swagger/json",
  });
};

function swaggerAuthConfig(): SecuritySchemeObject {
  return {
    scheme: "bearer",
    type: "http",
    in: "header",
    bearerFormat: "JWT",
  };
}
