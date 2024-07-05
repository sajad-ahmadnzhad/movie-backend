import { MailerAsyncOptions } from "@nestjs-modules/mailer/dist/interfaces/mailer-async-options.interface";
import { ConfigService } from "@nestjs/config";

export const mailConfig = (): MailerAsyncOptions => {
  return {
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
      return {
        transport: {
          service: "gmail",
          port: 578,
          secure: false,
          logger: true,
          debug: true,
          auth: {
            user: configService.get("GMAIL_USER"),
            pass: configService.get("GMAIL_PASS"),
          },
          tls: { rejectUnauthorized: false },
        },
      };
    },
  };
};
