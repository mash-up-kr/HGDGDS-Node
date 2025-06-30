import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PresignedUrlResponse } from './response/presigned.url.response';
import { InternalServerException } from '@/common/exception/internal-server.exception';

@Injectable()
export class FilesService {
  private s3: S3Client;
  private readonly bucket = process.env.AWS_S3_BUCKET!;
  private readonly region = process.env.AWS_REGION!;
  private readonly s3AccessKey = process.env.AWS_S3_ACCESS_KEY!;
  private readonly s3SecretKey = process.env.AWS_S3_SECRET_KEY!;

  constructor() {
    this.s3 = new S3Client({
      region: this.region,
      credentials: {
        accessKeyId: this.s3AccessKey,
        secretAccessKey: this.s3SecretKey,
      },
    });
  }

  private async generatePresignedUrl(
    command: PutObjectCommand | GetObjectCommand,
    expiresIn: number = 60 * 5,
  ) {
    try {
      return await getSignedUrl(this.s3, command, { expiresIn });
    } catch {
      throw new InternalServerException('Presigned URL 생성에 실패했습니다.');
    }
  }

  async getUploadPresignedUrl(
    filePrefix: string,
    fileExtension: string,
  ): Promise<PresignedUrlResponse> {
    const fileId = uuidv4();
    const filePath = filePrefix + '/' + fileId + '.' + fileExtension;
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: filePath,
    });
    const presignedUrl = await this.generatePresignedUrl(command);
    return new PresignedUrlResponse(presignedUrl, filePath);
  }

  async getAccessPresignedUrl(filePath: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: filePath,
    });
    const presignedUrl = await this.generatePresignedUrl(command);
    return presignedUrl;
  }
}
