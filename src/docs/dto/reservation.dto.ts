import { BasePaginationQueryDto } from '@/common/dto/request';
import { PaginationMetadata } from '@/common/dto/response';
import { ReservationCategory } from '@/common/enums/reservation-category';
import { UserReservationStatus } from '@/common/enums/user-reservation-status';
import { Reservation } from '@/reservations/entities/reservation.entity';
import { User } from '@/users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsIn } from 'class-validator';

export class CreateReservationResponse {
  @ApiProperty({
    description: '생성된 예약 ID',
    example: 42,
  })
  reservationId: number;

  @ApiProperty({
    description: '이벤트 제목',
    example: '흑백 돼지',
  })
  title: string;

  @ApiProperty({
    description: '예약 카테고리',
    example: 'FOOD',
  })
  category: string;

  @ApiProperty({
    description: '예약 일시',
    example: '2025-01-04T09:00:00+09:00',
  })
  reservationDatetime: Date;

  @ApiProperty({
    description: '외부 링크 URL',
    example: 'https://naver.me/xyz',
    nullable: true,
  })
  linkUrl: string | null;

  @ApiProperty({
    description: '설명 내용',
    example: '흑백요리사 음식점 부시기',
    nullable: true,
  })
  description: string | null;

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
    description: '예약 생성 시간',
    example: '2025-08-21T20:00:00+09:00',
  })
  createdAt: Date;

  constructor(reservation: Reservation, host: User, imageUrls?: string[]) {
    this.reservationId = reservation.id;
    this.title = reservation.title;
    this.category = reservation.category;
    this.reservationDatetime = reservation.reservationDatetime;
    this.linkUrl = reservation.linkUrl;
    this.description = reservation.description;
    this.imageUrls = imageUrls ?? [];
    this.hostId = host.id;
    this.createdAt = reservation.createdAt;
  }
}

/**
 * 예약 리스트에서 예약정보 조회
 */
export class GetReservationsQueryDto extends BasePaginationQueryDto {
  @ApiProperty({
    description: '예약 상태 필터',
    enum: ['before', 'after'],
    required: false,
    example: 'after',
  })
  @IsOptional()
  @IsIn(['before', 'after'])
  readonly status?: 'before' | 'after';

  @ApiProperty({
    description: '커서 (마지막 조회된 예약 ID)',
    required: false,
    example: 4,
    type: 'number',
  })
  @IsOptional()
  readonly cursor?: number;
}

export class ReservationItemDto {
  @ApiProperty({
    description: '예약 ID',
    example: 1,
  })
  reservationId: number;

  @ApiProperty({
    description: '예약 제목',
    example: '매쉬업 아구찜 직팬 모임',
  })
  title: string;

  @ApiProperty({
    description: '예약 카테고리',
    example: '운동경기',
    enum: ReservationCategory,
  })
  category: string;

  @ApiProperty({
    description: '예약 일시',
    example: '2025-07-11T19:00:00+09:00',
  })
  reservationDatetime: string;

  @ApiProperty({
    description: '현재 참가자 수',
    example: 3,
  })
  participantCount: number;

  @ApiProperty({
    description: '최대 참가자 수',
    example: 5,
  })
  maxParticipants: number;

  @ApiProperty({
    description: '호스트 사용자 ID',
    example: 1,
  })
  hostId: number;

  @ApiProperty({
    description: '호스트 닉네임',
    example: '서연',
  })
  hostNickname: string;

  @ApiProperty({
    description: '예약 이미지 URL 목록',
    example: ['path/image1.jpg'],
  })
  images: string[];

  @ApiProperty({
    description: '현재 사용자의 예약 상태',
    example: UserReservationStatus.DEFAULT,
    enum: UserReservationStatus,
  })
  userStatus: string;

  @ApiProperty({
    description: '현재 사용자가 호스트인지 여부',
    example: false,
  })
  isHost: boolean;
}

export class GetReservationsDataDto {
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
}

export class GetReservationsResponseDto {
  @ApiProperty({
    description: '응답 코드',
    example: '200',
  })
  code: string;

  @ApiProperty({
    description: '응답 메시지',
    example: 'OK',
  })
  message: string;

  @ApiProperty({
    description: '예약 목록 데이터',
    type: GetReservationsDataDto,
  })
  data: GetReservationsDataDto;
}
