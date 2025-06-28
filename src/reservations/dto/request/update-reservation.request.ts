import { ApiProperty } from '@nestjs/swagger';
import { ReservationCategory } from '@/common/enums/reservation-category';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class UpdateReservationRequest {
  @ApiProperty({
    description: '이벤트 제목',
    example: '오아시스를 직접 본다니',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ApiProperty({
    enum: ReservationCategory,
    description: '예약 카테고리',
    example: '공연',
    required: false,
  })
  @IsOptional()
  @IsEnum(ReservationCategory, {
    message: 'ReservationCategory enum이 아닙니다.',
  })
  category?: ReservationCategory;

  @ApiProperty({
    description: '예약 일시 KST(ISO8601 형식)',
    example: '2025-08-21T20:00:00+09:00',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  reservationDatetime?: string;

  @ApiProperty({
    description: '설명 내용',
    example: '1순위로 E열 선정하기. 만약에 안되면 H도 괜찮아요',
    required: false,
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    description: '외부 링크 URL',
    example: 'https://tickets.interpark.com/goods/12345',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  linkUrl?: string;

  @ApiProperty({
    description:
      'S3 이미지 path 목록 (최대 3개), /files/presigned-url/upload API response의 filePath를 사용',
    example: ['path/image1.jpg', 'path/image2.jpg'],
    required: false,
    maxItems: 3,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  images?: string[];
}
