import { NestMiddleware, Injectable } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import * as rfs from "rotating-file-stream";
import * as path from "path";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logStream = rfs.createStream("application.log", {
    interval: "5d",
    path: path.join(process.cwd(), "src", "common", "logs"),
    size: "10M",
  });

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
