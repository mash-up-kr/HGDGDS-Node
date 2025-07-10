import { ApiProperty } from '@nestjs/swagger';
import { ReservationItemDto } from '@/docs/dto/reservation.dto';
import { PaginationMetadata } from '@/common';

export class GetReservationsResponse {
  @ApiProperty({
    description: '예약 목록',
    type: [ReservationItemDto],
  })
  reservations: ReservationItemDto[];

  @ApiProperty({
    description: '페이지네이션 메타데이터',
    type: () => PaginationMetadata,
  })
  metadata: PaginationMetadata;

  constructor(
    reservations: ReservationItemDto[],
    metadata: PaginationMetadata,
  ) {
    this.reservations = reservations;
    this.metadata = metadata;
  }
}
