namespace NodeJS {
  interface ProcessEnv {
    //* Application
    PORT: string;
    BASE_URL: string;
    ALLOWED_ORIGINS: string;
    //* Secretes
    ACCESS_TOKEN_SECRET: string;
    REFRESH_TOKEN_SECRET: string;
    ACCESS_TOKEN_EXPIRE_TIME: string;
    REFRESH_TOKEN_EXPIRE_TIME: string;
    //* Gmail
    GMAIL_USER: string;
    GMAIL_PASS: string;

    //* Mysql database config
    DB_HOST: string;
    DB_PORT: string;
    DB_USERNAME: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    DB_SYNCHRONIZE: string;

    //* Basic auth
    BASIC_AUTH_USERNAME: string;
    BASIC_AUTH_PASSWORD: string;

    //* Redis config
    REDIS_HOST: string;
    REDIS_PORT: string;

    //NODE ENV
    NODE_ENV: "dev" | "prod";

    //S3 config env
    S3_ACCESS_KEY: string;
    S3_SECRET_KEY: string;
    S3_ENDPOINT: string;
    S3_BUCKET_NAME: string;
  }
}
