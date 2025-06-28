// src/common/dto/response/cursor-page.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Reservation } from '@/reservations/entities/reservation.entity'; // 실제 경로에 맞게 수정
import { CursorPageMetaDto } from './cursor-page-meta.dto';

export class CursorPageDto {
  @ApiProperty({
    type: [Reservation],
    description: '예약 목록 데이터',
  })
  reservations: Reservation[];

  @ApiProperty({
    type: CursorPageMetaDto,
    description: '페이지네이션 메타데이터',
  })
  metadata: CursorPageMetaDto;

  constructor(reservations: Reservation[], meta: CursorPageMetaDto) {
    this.reservations = reservations;
    this.metadata = meta;
  }
}
