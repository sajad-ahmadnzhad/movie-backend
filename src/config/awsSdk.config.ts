import { S3 } from "aws-sdk";
import {
  AwsService,
  AwsServiceConfigurationOptionsFactory,
  AwsServiceType,
  AwsServiceWithServiceOptions,
} from "nest-aws-sdk";

export const awsSdkConfig = (): {
  defaultServiceOptions?: AwsServiceConfigurationOptionsFactory;
  services?: Array<AwsServiceType<AwsService> | AwsServiceWithServiceOptions>;
} => {
  return {
    defaultServiceOptions: {
      region: "default",
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
      },
      endpoint: process.env.S3_ENDPOINT,
    },
    services: [S3],
  };
};
