import { Injectable } from "@nestjs/common";
import { AWSError, S3 } from "aws-sdk";
import { PromiseResult } from "aws-sdk/lib/request";
import { InjectAwsService } from "nest-aws-sdk";
import * as path from "path";
import { lookup } from "mime-types";

@Injectable()
export class S3Service {
  //@ts-ignore
  constructor(@InjectAwsService(S3) private readonly s3: S3) {}

  uploadFile(
    file: Express.Multer.File,
    folderName: string
  ): Promise<S3.ManagedUpload.SendData> {
    const ext = path.extname(file.originalname).toLowerCase();
    const fileName = `${folderName}/${Date.now()}-${file.originalname}`;
    const contentType = lookup(ext) || "application/octet-stream";

    return this.s3
      .upload({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,
        ContentType: contentType,
      })
      .promise();
  }

  deleteFile(
    url: string
  ): Promise<PromiseResult<S3.DeleteObjectOutput, AWSError>> {
    const key = this.extractKeyFromUrl(url);

    return this.s3
      .deleteObject({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: decodeURI(key),
      })
      .promise();
  }

  private extractKeyFromUrl(url: string): string {
    const urlParts = url.split("/");

    const key = urlParts.slice(3).join("/");

    return decodeURI(key);
  }
}
