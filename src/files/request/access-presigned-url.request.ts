import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AccessPresignedUrlRequest {
  @ApiProperty({
    description: '접근할 파일 경로',
    example: '/reservations/{reservation_id}/info/uuid.png',
  })
  @IsString()
  filePath: string;
}
