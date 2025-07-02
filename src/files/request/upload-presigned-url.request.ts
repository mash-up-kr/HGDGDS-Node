import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class UploadPresignedUrlRequest {
  @ApiProperty({
    description: `파일 종류 (파일 저장 경로의 prefix)
- 예약 정보: /reservations/info
- 예약 결과: /reservations/result`,
    example: '/reservations/info',
  })
  @IsString()
  @IsIn(['/reservations/info', '/reservations/result'])
  filePrefix: string;

  @ApiProperty({
    description: '파일의 확장자',
    example: 'jpeg, png, ...',
  })
  @IsString()
  fileExtension: string;
}
