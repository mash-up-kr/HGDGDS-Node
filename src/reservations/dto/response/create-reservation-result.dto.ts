import { ReservationResultStatus } from '@/common/enums/reservation-result-status';
import { ReservationResult } from '@/reservations/entities/reservation-result.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export class CreateReservationResultDto {
  @ApiProperty({
    description: '예약 결과 ID',
    example: 1,
  })
  reservationResultId: number;

  @ApiProperty({
    description: '예약 ID',
    example: 12345,
  })
  reservationId: number;

  @ApiProperty({
    description: '결과를 등록한 사용자 ID',
    example: 1,
  })
  userId: number;

  @ApiProperty({
    description: '예약 결과 상태',
    enum: ReservationResultStatus,
    example: ReservationResultStatus.HALF_SUCCESS,
  })
  @IsEnum(ReservationResultStatus)
  status: ReservationResultStatus;

  @ApiProperty({
    required: false,
    type: [String],
    isArray: true,
    example: ['http://abc.com', 'http://abc.com'],
    description: '결과 이미지 URL 배열',
  })
  images: string[] | null;

  @ApiProperty({
    description: '예약 일시 KST(ISO8601 형식)',
    example: '2025-01-04T09:00:00+09:00',
  })
  successDatetime: Date | null;

  @ApiProperty()
  description: string;

  @ApiProperty({
    example: '2025-01-04T09:00:00+09:00',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-08-21T20:00:00+09:00',
  })
  updatedAt: Date;

  constructor(result: ReservationResult, images: string[] | null) {
    this.reservationResultId = result.id;
    this.reservationId = result.reservation.id;
    this.description = result.description ?? '';
    this.successDatetime = result.successDatetime ?? null;
    this.status = result.status;
    this.images = images;
    this.userId = result.user.id;
    this.createdAt = result.createdAt;
    this.updatedAt = result.updatedAt;
  }
}
