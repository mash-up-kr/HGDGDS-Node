import { ApiProperty } from '@nestjs/swagger';
import { ReservationCategory } from '@/common/enums/reservation-category';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateReservationRequest {
  @ApiProperty({
    description: '이벤트 제목',
    example: '흑백 돼지',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  title: string;

  @ApiProperty({
    enum: ReservationCategory,
    description: '예약 카테고리',
    example: 'FOOD',
  })
  @IsEnum(ReservationCategory, {
    message: 'ReservationCategory enum이 아닙니다.',
  })
  category: ReservationCategory;

  @ApiProperty({
    description: '예약 일시 KST(ISO8601 형식)',
    example: '2025-01-04T09:00:00+09:00',
  })
  @IsDateString()
  reservationDatetime: string;

  @ApiProperty({
    description: '외부 링크 URL',
    example: 'https://naver.me/xyz',
  })
  @IsUrl()
  linkUrl?: string;

  @ApiProperty({
    description: '설명 내용',
    example: '흑백요리사 음식점 부시기',
    required: false,
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    description:
      'S3 이미지 path 목록 (최대 3개), /files/presigned-url/upload API response의 filePath를 사용',
    example: ['path/image1.jpg', 'path/image1.jpg'],
    required: false,
    maxItems: 3,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  images?: string[];
}
