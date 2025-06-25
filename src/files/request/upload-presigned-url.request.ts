import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { IsValidFilePrefix } from '../validator/file-prefix.validator';

export class UploadPresignedUrlRequest {
  @ApiProperty({
    description: `파일 종류 (파일 저장 경로의 prefix)
- 예약 정보: /reservations/{reservation_id}/info
- 예약 결과: /reservations/{reservation_id}/result`,
    example: '/reservations/{reservation_id}/info',
  })
  @IsString()
  @IsValidFilePrefix()
  filePrefix: string;
  @ApiProperty({
    description: '파일의 확장자',
    example: 'jpeg, png, ...',
  })
  @IsString()
  fileExtension: string;
}
