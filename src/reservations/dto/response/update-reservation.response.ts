import { ApiProperty } from '@nestjs/swagger';
import { Reservation } from '@/reservations/entities/reservation.entity';
import { User } from '@/users/entities/user.entity';

export class UpdateReservationResponse {
  @ApiProperty({
    description: '예약 ID',
    example: 42,
  })
  reservationId: number;

  @ApiProperty({
    description: '수정된 제목',
    example: '오아시스를 직접 본다니',
  })
  title: string;

  @ApiProperty({
    description: '수정된 카테고리',
    example: 'PERFORMANCE',
  })
  category: string;

  @ApiProperty({
    description: '수정된 예약 일시',
    example: '2025-08-21T20:00:00+09:00',
  })
  reservationDatetime: Date;

  @ApiProperty({
    description: '수정된 설명',
    example: '1순위로 E열 선정하기. 만약에 안되면 H도 괜찮아요',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: '수정된 링크 URL',
    example: 'https://tickets.interpark.com/goods/12345',
    nullable: true,
  })
  linkUrl: string | null;

  @ApiProperty({
    description:
      '이미지 조회용 presigned URL 목록, url을 GET으로 호출하면 파일조회 가능',
    example: ['http://어쩌구', 'http://저쩌구'],
  })
  imageUrls: string[];

  @ApiProperty({
    description: '호스트 사용자 ID',
    example: 1,
  })
  hostId: number;

  @ApiProperty({
    description: '현재 참가자 수',
    example: 4,
  })
  participantCount: number;

  @ApiProperty({
    description: '생성 시간',
    example: '2025-08-21T20:00:00+09:00',
  })
  createdAt: Date;

  @ApiProperty({
    description: '수정 시간',
    example: '2025-08-21T20:00:00+09:00',
  })
  updatedAt: Date;

  constructor(
    reservation: Reservation,
    host: User,
    participantCount: number,
    imageUrls?: string[],
  ) {
    this.reservationId = reservation.id;
    this.title = reservation.title;
    this.category = reservation.category;
    this.reservationDatetime = reservation.reservationDatetime;
    this.description = reservation.description;
    this.linkUrl = reservation.linkUrl;
    this.imageUrls = imageUrls ?? [];
    this.hostId = host.id;
    this.participantCount = participantCount;
    this.createdAt = reservation.createdAt;
    this.updatedAt = reservation.updatedAt;
  }
}
