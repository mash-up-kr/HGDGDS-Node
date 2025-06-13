import { ApiProperty } from '@nestjs/swagger';

export class PresignedUrlResponse {
  @ApiProperty({
    description: 'Presigned URL',
    example: 'https://example.com/presigned-url',
  })
  url: string;

  constructor(url: string) {
    this.url = url;
  }
}
