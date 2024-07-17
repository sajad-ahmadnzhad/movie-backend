import { NestMiddleware, Injectable } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import * as rfs from "rotating-file-stream";
import * as path from "path";
import * as fs from "fs";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logStream: rfs.RotatingFileStream;

  constructor() {
    const logDirectory = path.join(__dirname, "..", "logs");

    if (!fs.existsSync(logDirectory))
      fs.mkdirSync(logDirectory, { recursive: true });

    this.logStream = rfs.createStream("application.log", {
      interval: "5d",
      path: path.join(__dirname, "..", "logs"),
      size: "10M",
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on("finish", () => {
      const duration = Date.now() - start;
      const logMessage = `Date: ${new Date().toISOString()} | \
Method: ${req.method} | \
Url: ${req.url} | \
StatusCode: ${res.statusCode} | \
Duration: ${duration}ms | \
Ip: ${req.ip} | \
ContentLength: ${res.get("content-length")}byte | \
UserAgent: ${req.headers["user-agent"]} \n`;

      this.logStream.write(logMessage);
    });
    next();
  }
}
