import { BasePaginationQueryDto } from '@/common/dto/request';
import { ReservationCategory } from '@/common/enums/reservation-category';
import { Reservation } from '@/reservations/entities/reservation.entity';
import { User } from '@/users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum } from 'class-validator';
import { UserReservationStatus } from '@/common/enums/user-reservation-status';
import { ProfileImageCode } from '@/common/enums/profile-image-code';

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
export enum ReservationStatusFilter {
  AFTER = 'AFTER',
  BEFORE = 'BEFORE',
}
export class GetReservationsQueryDto extends BasePaginationQueryDto {
  @ApiProperty({
    description: '예약 상태 필터 (AFTER: 예정된 예약, BEFORE: 지난 예약)',
    enum: ReservationStatusFilter,
    required: false,
    example: ReservationStatusFilter.AFTER,
  })
  @IsOptional()
  @IsEnum(ReservationStatusFilter)
  readonly status?: ReservationStatusFilter;
}

export class ReservationItemDto {
  @ApiProperty({
    description: '예약 ID',
    example: 1,
  })
  reservationId: number;

  @ApiProperty({
    description: '예약 제목',
    example: '매쉬업 야구장 직관 모임',
  })
  title: string;

  @ApiProperty({
    description: '예약 카테고리',
    enum: ReservationCategory,
    example: ReservationCategory.SPORTS,
  })
  category: ReservationCategory;

  @ApiProperty({
    description: '예약 일시',
    example: '2025-07-11T19:00:00+09:00',
  })
  reservationDatetime: Date;

  @ApiProperty({
    description: '현재 참가자 수',
    example: 6,
  })
  participantCount: number;

  @ApiProperty({
    description: '최대 참가자 수',
    example: 20,
  })
  maxParticipants: number;

  @ApiProperty({
    description: '호스트 사용자 ID',
    example: 10,
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
  userStatus: UserReservationStatus;

  @ApiProperty({
    description: '현재 사용자가 호스트인지 여부',
    example: false,
  })
  isHost: boolean;

  @ApiProperty({
    description: '프로필 이미지 코드 목록',
    enum: ProfileImageCode,
    isArray: true,
    example: [
      ProfileImageCode.PINK,
      ProfileImageCode.PURPLE,
      ProfileImageCode.ORANGE,
    ],
  })
  profileImageCodeList: ProfileImageCode[];

  constructor(
    reservationId: number,
    title: string,
    category: ReservationCategory,
    reservationDatetime: Date,
    participantCount: number,
    maxParticipants: number,
    hostId: number,
    hostNickname: string,
    images: string[],
    userReservationStatus: UserReservationStatus,
    isHost: boolean,
    profileImageCodeList: ProfileImageCode[],
  ) {
    this.reservationId = reservationId;
    this.title = title;
    this.category = category;
    this.reservationDatetime = reservationDatetime;
    this.participantCount = participantCount;
    this.maxParticipants = maxParticipants;
    this.hostId = hostId;
    this.hostNickname = hostNickname;
    this.images = images;
    this.userStatus = userReservationStatus;
    this.isHost = isHost;
    this.profileImageCodeList = profileImageCodeList;
  }
}
