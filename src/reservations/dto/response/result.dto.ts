import { ApiProperty } from '@nestjs/swagger';

export class ReservationResultDto {
  @ApiProperty({
    description: '예약 ID',
    example: 12345,
  })
  reservationId: number;

  @ApiProperty({
    description: '사용자 ID',
    example: 67890,
  })
  userId: number;

  @ApiProperty()
  isSuccess: boolean;

  @ApiProperty({
    required: false,
    type: [String],
    isArray: true,
    example: ['path/image1.jpg', 'path/image2.jpg'],
    description: '결과 이미지 URL 배열',
  })
  images: string[] | null;

  @ApiProperty({
    description: '예약 일시 (ISO8601 형식)',
    example: '2025-01-04T09:00:00+09:00',
  })
  resultDatetime: string;

  @ApiProperty()
  description: string;

  @ApiProperty({
    example: '2024-06-03T10:00:00Z',
  })
  createdAt: string;

  @ApiProperty({
    example: '2024-06-03T10:00:00Z',
  })
  updatedAt: string;

  constructor(
    reservationId: number,
    userId: number,
    createdAt: string,
    updatedAt: string,
  ) {
    this.reservationId = reservationId;
    this.userId = userId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
