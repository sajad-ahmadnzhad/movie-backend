import { Injectable, InternalServerErrorException } from "@nestjs/common";
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

  async multipartUploadFile(
    file: Express.Multer.File,
    folderName: string
  ): Promise<any> {
    const ext = path.extname(file.originalname).toLowerCase();
    const fileName = `${folderName}/${Date.now()}-${file.originalname}`;
    const contentType = lookup(ext) || "application/octet-stream";
    const partSize = 5 * 1024 * 1024;
    const promiseParts: Array<
      Promise<S3.UploadPartOutput & { PartNumber: number }>
    > = [];

    const { UploadId } = await this.s3
      .createMultipartUpload({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileName,
        ContentType: contentType,
      })
      .promise();

    if (!UploadId) {
      throw new InternalServerErrorException(
        "Failed to initiate multipart upload."
      );
    }

    for (let i = 0; i < Math.ceil(file.buffer.length / partSize); i++) {
      const promisePart = this.s3
        .uploadPart({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: fileName,
          PartNumber: i + 1,
          UploadId: UploadId as string,
          Body: file.buffer.slice(i * partSize, (i + 1) * partSize),
        })
        .promise()
        .then((result) => ({ ...result, PartNumber: i + 1 }));

      promiseParts.push(promisePart);
    }

    const allParts = await Promise.all(promiseParts);

    return this.s3
      .completeMultipartUpload({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: fileName,
        UploadId: UploadId as string,
        MultipartUpload: { Parts: allParts },
      })
      .promise();
  }
}
