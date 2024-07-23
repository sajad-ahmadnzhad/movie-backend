import { DataSource } from "typeorm";
import { config } from "dotenv";
import * as path from "path";

config({ path: path.join(process.cwd() + `/.env.${process.env.NODE_ENV}`) });

export default new DataSource({
  type: "mysql",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  synchronize: false,
  migrations: ["dist/migrations/*{.ts,.js}"],
  entities: ["dist/**/**/**/*.entity{.ts,.js}", "dist/**/**/*.entity{.ts,.js}"],
});
