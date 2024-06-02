namespace NodeJS {
  interface ProcessEnv {
    //* Databases
    MONGODB_URI: string;
    REDIS_HOST: string;
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
  }
}
