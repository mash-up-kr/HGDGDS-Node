import { ApiProperty } from '@nestjs/swagger';

export class PresignedUrlResponse {
  @ApiProperty({
    description: 'Presigned URL',
    example: 'https://example.com/presigned-url',
  })
  presignedUrl: string;

  @ApiProperty({
    description: '파일 저장 경로',
    example: '/reservations/{reservation_id}/info/uuid.png',
  })
  filePath: string;

  constructor(url: string, filePath: string) {
    this.presignedUrl = url;
    this.filePath = filePath;
  }
}
