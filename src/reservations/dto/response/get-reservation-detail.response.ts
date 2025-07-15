import { ApiProperty } from '@nestjs/swagger';
import { UserReservationStatus } from '@/common/enums/user-reservation-status';

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
    description: '호스트 프로필 이미지 URL',
    example: 'https://s3.amazonaws.com/bucket/profile-images/IMG_001.png',
  })
  profileImageName: string;
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
    example: true,
  })
  canJoin: boolean;
}

export class GetReservationDetailResponse {
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
    example: 'PERFORMANCE',
  })
  category: string;

  @ApiProperty({
    description: '예약 일시',
    example: '2025-08-21T19:00:00+09:00',
  })
  reservationDatetime: Date;

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
    example: [
      'https://s3.amazonaws.com/bucket/image1.jpg',
      'https://s3.amazonaws.com/bucket/image2.jpg',
    ],
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
    example: 30,
  })
  maxParticipants: number;

  @ApiProperty({
    description: '예약 생성 시간',
    example: '2025-06-13T10:00:00+09:00',
  })
  createdAt: Date;

  @ApiProperty({
    description: '예약 수정 시간',
    example: '2025-06-13T15:30:00+09:00',
  })
  updatedAt: Date;

  constructor(
    reservationId: number,
    title: string,
    category: string,
    reservationDatetime: Date,
    description: string | null,
    linkUrl: string | null,
    images: string[],
    host: HostInfoDto,
    currentUser: CurrentUserInfoDto,
    participantCount: number,
    maxParticipants: number,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.reservationId = reservationId;
    this.title = title;
    this.category = category;
    this.reservationDatetime = reservationDatetime;
    this.description = description;
    this.linkUrl = linkUrl;
    this.images = images;
    this.host = host;
    this.currentUser = currentUser;
    this.participantCount = participantCount;
    this.maxParticipants = maxParticipants;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}
