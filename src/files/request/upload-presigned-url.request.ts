import { ApiProperty } from '@nestjs/swagger';

export class UploadPresignedUrlRequest {
  @ApiProperty({
    description: `파일 종류 (파일 저장 경로의 prefix)
- 예약 정보: /reservations/{reservation_id}/info
- 예약 결과: /reservations/{reservation_id}/result`,
    example: '/reservations/{reservation_id}/info',
  })
  filePrefix: string;
}
