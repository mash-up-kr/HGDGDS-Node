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
    example: '맛집',
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

export class ParticipantInfoDto {
  @ApiProperty({
    description: '현재 참가자 수 (주최자 포함)',
    example: 4,
  })
  currentCount: number;

  @ApiProperty({
    description: '최대 참가자 수',
    example: 20,
  })
  maxCount: number;

  @ApiProperty({
    description: '남은 자리 수',
    example: 16,
  })
  availableSlots: number;
}

export class ReservationSummaryDto {
  @ApiProperty({
    description: '예약 ID',
    example: 42,
  })
  reservationId: number;

  @ApiProperty({
    description: '예약 제목',
    example: '브런치 모임',
  })
  title: string;

  @ApiProperty({
    description: '예약 카테고리',
    example: '맛집',
  })
  category: string;

  @ApiProperty({
    description: '예약 일시',
    example: '2025-01-04T09:00:00+09:00',
  })
  reservationDatetime: string;

  @ApiProperty({
    description: '호스트 사용자 ID',
    example: 1,
  })
  hostId: number;
}

export class JoinReservationDataDto {
  @ApiProperty({
    description: '예약 ID',
    example: 42,
  })
  reservationId: number;

  @ApiProperty({
    description: '참가한 사용자 ID',
    example: 123,
  })
  userId: number;

  @ApiProperty({
    description: '참가 시간',
    example: '2025-08-21T20:00:00+09:00',
  })
  joinedAt: string;

  @ApiProperty({
    description: '참가자 정보',
    type: ParticipantInfoDto,
  })
  participantInfo: ParticipantInfoDto;

  @ApiProperty({
    description: '예약 정보 요약',
    type: ReservationSummaryDto,
  })
  reservation: ReservationSummaryDto;
}

export class JoinReservationResponseDto {
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
    description: '예약 참가 결과',
    type: JoinReservationDataDto,
  })
  data: JoinReservationDataDto;
}

export enum ReservationStatusFilter {
  BEFORE = 'before',
  AFTER = 'after',
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

/**
 * 예약상세
 */
export class HostInfoDto {
  @ApiProperty({
    description: '호스트 사용자 ID',
    example: 1,
  })
  hostId: number;

  @ApiProperty({
    description: '호스트 닉네임',
    example: '김파디',
  })
  nickname: string;

  @ApiProperty({
    description: '호스트 프로필 이미지',
    example: 'IMG_001',
  })
  profileImageName: string;
}

export class ParticipantDto {
  @ApiProperty({
    description: '참가자 사용자 ID',
    example: 2,
  })
  userId: number;

  @ApiProperty({
    description: '참가자 닉네임',
    example: '김파디',
  })
  nickname: string;

  @ApiProperty({
    description: '참가자 프로필 이미지',
    example: 'IMG_002',
  })
  profileImageName: string;

  @ApiProperty({
    description: '참가자의 예약 상태',
    example: UserReservationStatus.READY,
    enum: UserReservationStatus,
  })
  status: string;

  @ApiProperty({
    description: '호스트 여부',
    example: false,
  })
  isHost: boolean;
}

export class CurrentUserInfoDto {
  @ApiProperty({
    description: '현재 사용자 ID',
    example: 123,
  })
  userId: number;

  @ApiProperty({
    description: '현재 사용자의 예약 상태',
    example: UserReservationStatus.DEFAULT,
    enum: UserReservationStatus,
  })
  status: string;

  @ApiProperty({
    description: '현재 사용자가 호스트인지 여부',
    example: false,
  })
  isHost: boolean;

  @ApiProperty({
    description: '예약 수정 권한 여부',
    example: false,
  })
  canEdit: boolean;

  @ApiProperty({
    description: '예약 참가 가능 여부',
    example: false,
  })
  canJoin: boolean;
}

export class ReservationDetailDto {
  @ApiProperty({
    description: '예약 ID',
    example: 42,
  })
  reservationId: number;

  @ApiProperty({
    description: '예약 제목',
    example: '오아시스를 직접 본다니',
  })
  title: string;

  @ApiProperty({
    description: '예약 카테고리',
    example: '아구',
  })
  category: string;

  @ApiProperty({
    description: '예약 일시',
    example: '2025-08-21T19:00:00+09:00',
  })
  reservationDatetime: string;

  @ApiProperty({
    description: '예약 설명',
    example: '1순위로 E열 선정하기. 만약에 안되면 H도 괜찮아요',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: '관련 링크 URL',
    example: 'https://example.com/reservation-link',
    nullable: true,
  })
  linkUrl: string | null;

  @ApiProperty({
    description: '예약 이미지 URL 목록',
    example: ['path/image1.jpg', 'path/image1.jpg'],
  })
  images: string[];

  @ApiProperty({
    description: '호스트 정보',
    type: HostInfoDto,
  })
  host: HostInfoDto;

  @ApiProperty({
    description: '현재 사용자 정보',
    type: CurrentUserInfoDto,
  })
  currentUser: CurrentUserInfoDto;

  @ApiProperty({
    description: '현재 참가자 수',
    example: 4,
  })
  participantCount: number;

  @ApiProperty({
    description: '최대 참가자 수',
    example: 6,
  })
  maxParticipants: number;

  @ApiProperty({
    description: '예약 생성 시간',
    example: '2025-08-21T20:00:00+09:00',
  })
  createdAt: string;

  @ApiProperty({
    description: '예약 수정 시간',
    example: '2025-08-21T20:00:00+09:00',
  })
  updatedAt: string;
}

export class GetReservationDetailResponseDto {
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
    description: '예약 상세 정보',
    type: ReservationDetailDto,
  })
  data: ReservationDetailDto;
}
