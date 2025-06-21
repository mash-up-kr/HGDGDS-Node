import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class FilesService {
  private s3: S3Client;
  private readonly bucket = process.env.AWS_S3_BUCKET!;
  private readonly region = process.env.AWS_REGION!;
  private readonly accessKeyId = process.env.AWS_ACCESS_KEY_ID!;
  private readonly secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY!;

  constructor() {
    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
    });
  }

  private async generatePresignedUrl(
    command: PutObjectCommand | GetObjectCommand,
    expiresIn: number = 60 * 5,
  ) {
    try {
      return await getSignedUrl(this.s3, command, { expiresIn });
    } catch (error) {
      console.error('Error generating presigned URL:', error);
      throw new InternalServerErrorException(
        'Presigned URL 생성에 실패했습니다.',
      );
    }
  }

  async getUploadPresignedUrl(
    key: string,
    contentType: string,
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });
    return await this.generatePresignedUrl(command);
  }

  async getAccessPresignedUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    return await this.generatePresignedUrl(command);
  }
}
