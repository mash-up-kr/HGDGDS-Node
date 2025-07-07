import { ReservationResultStatus } from '@/common/enums/reservation-result-status';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateReservationResultRequest {
  @ApiProperty({
    enum: ReservationResultStatus,
    example: ReservationResultStatus.HALF_SUCCESS,
  })
  @IsEnum(ReservationResultStatus)
  status: ReservationResultStatus;

  @ApiProperty({
    required: false,
    type: [String],
    isArray: true,
    example: ['path/image1.jpg', 'path/image2.jpg'],
    description: '결과 이미지 URL 배열',
  })
  @IsArray()
  images: string[] | null;

  @ApiProperty({
    description: '예약된 일정의 일시(예약 결과 일시)) KST(ISO8601 형식)',
    example: '2025-01-04T09:00:00+09:00',
  })
  @IsDateString()
  successDatetime: Date;

  @ApiProperty()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsUrl()
  @IsOptional()
  linkUrl?: string;
}
