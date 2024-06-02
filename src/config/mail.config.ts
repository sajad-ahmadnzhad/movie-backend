import { MailerAsyncOptions } from "@nestjs-modules/mailer/dist/interfaces/mailer-async-options.interface";

export const mailConfig = (): MailerAsyncOptions => {
  const { GMAIL_USER, GMAIL_PASS } = process.env;
  return {
    useFactory: () => {
      return {
        transport: {
          service: "gmail",
          port: 578,
          secure: false,
          logger: true,
          debug: true,
          auth: {
            user: GMAIL_USER,
            pass: GMAIL_PASS,
          },
          tls: { rejectUnauthorized: false },
        },
      };
    },
  };
};
