import { ApiProperty } from '@nestjs/swagger';

export class AccessPresignedUrlRequest {
  @ApiProperty({
    description: '접근할 파일 경로',
    example: '/reservations/{reservation_id}/info/uuid.png',
  })
  filePath: string;
}
