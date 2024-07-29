import { Injectable } from "@nestjs/common";
import { AWSError, S3 } from "aws-sdk";
import { PromiseResult } from "aws-sdk/lib/request";
import { InjectAwsService } from "nest-aws-sdk";
import * as path from "path";

@Injectable()
export class S3Service {
  //@ts-ignore
  constructor(@InjectAwsService(S3) private readonly s3: S3) {}

  async uploadFile(
    file: Express.Multer.File,
    folderName: string
  ): Promise<S3.ManagedUpload.SendData> {
    const ext = path.extname(file.originalname);
    const fileName = `${folderName}/${Date.now()}-${file.originalname}-${ext}`;
    return this.s3
      .upload({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,
        ContentType: "image/png",
      })
      .promise();
  }

  async deleteFile(
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

  extractKeyFromUrl(url: string): string {
    const urlParts = url.split("/");

    const key = urlParts.slice(3).join("/");

    return decodeURI(key);
  }
}
