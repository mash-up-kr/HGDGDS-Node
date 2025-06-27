import { BasePaginationQueryDto } from '@/common/dto/request';
import { PaginationMetadata } from '@/common/dto/response';
import { ReservationCategory } from '@/common/enums/reservation-category';
import { UserReservationStatus } from '@/common/enums/user-reservation-status';
import { Reservation } from '@/reservations/entities/reservation.entity';
import { User } from '@/users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUrl,
  IsArray,
  ArrayMaxSize,
  IsNumber,
  IsDateString,
  IsIn,
  MaxLength,
} from 'class-validator';

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
  reservationDatetime: string;

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
    example: '2025-06-13T16:00:00Z',
  })
  createdAt: string;

  constructor(reservation: Reservation, host: User, imageUrls?: string[]) {
    this.reservationId = reservation.id;
    this.title = reservation.title;
    this.category = reservation.category;
    this.reservationDatetime = reservation.reservationDatetime.toISOString();
    this.linkUrl = reservation.linkUrl;
    this.description = reservation.description;
    this.imageUrls = imageUrls ?? [];
    this.hostId = host.id;
    this.createdAt = reservation.createdAt.toISOString();
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
    example: '2025-06-13T16:30:00Z',
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
    example: '기본',
    enum: ['기본', '준비완료', '실패', '성공'],
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
    example: '준비완료',
    enum: ['기본', '준비완료', '실패', '성공'],
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
    example: '기본',
    enum: ['기본', '준비완료', '실패', '성공'],
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
    example: '2025-06-13T10:00:00Z',
  })
  createdAt: string;

  @ApiProperty({
    description: '예약 수정 시간',
    example: '2025-06-13T15:30:00Z',
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

/**
 * 예약 리스트에서 멤버 조회
 */
export class MemberDto {
  @ApiProperty({
    description: '사용자 ID',
    example: 1,
  })
  userId: number;

  @ApiProperty({
    description: '사용자 닉네임',
    example: '김파디',
  })
  nickname: string;

  @ApiProperty({
    description: '프로필 이미지 코드 (01-05)',
    example: '01',
    enum: ['01', '02', '03', '04', '05'],
  })
  profileImageCode: string;

  @ApiProperty({
    description: '참가자의 예약 상태',
    example: 'READY',
    enum: UserReservationStatus,
  })
  status: string;

  @ApiProperty({
    description: '참가자의 예약 상태 (한글)',
    example: '준비완료',
    enum: ['기본', '준비완료', '실패', '성공'],
  })
  statusKr: string;

  @ApiProperty({
    description: '상태 메시지',
    example: '예약 내가 찢는다!',
    nullable: true,
  })
  statusMessage: string | null;

  @ApiProperty({
    description: '호스트(마스터) 여부',
    example: false,
  })
  isHost: boolean;
}

export class CurrentUserDto {
  @ApiProperty({
    description: '현재 사용자 ID',
    example: 123,
  })
  userId: number;

  @ApiProperty({
    description: '현재 사용자 닉네임',
    example: '김철수',
  })
  nickname: string;

  @ApiProperty({
    description: '현재 사용자 프로필 이미지 코드',
    example: '01',
    enum: ['01', '02', '03', '04', '05'],
  })
  profileImageCode: string;

  @ApiProperty({
    description: '현재 사용자의 예약 상태',
    example: 'default',
    enum: UserReservationStatus,
  })
  status: string;

  @ApiProperty({
    description: '현재 사용자의 예약 상태 (한글)',
    example: '기본',
    enum: ['기본', '준비완료', '실패', '성공'],
  })
  statusKr: string;

  @ApiProperty({
    description: '상태 메시지',
    example: '예약 내가 찢는다!',
    nullable: true,
  })
  statusMessage: string | null;

  @ApiProperty({
    description: '현재 사용자가 호스트(마스터)인지 여부',
    example: false,
  })
  isHost: boolean;
}

export class ReservationMembersDataDto {
  @ApiProperty({
    description: '예약 참가자 목록 (호스트 포함)',
    type: [MemberDto],
  })
  members: MemberDto[];

  @ApiProperty({
    description: '현재 사용자 정보',
    type: CurrentUserDto,
  })
  me: CurrentUserDto;

  @ApiProperty({
    description: '총 참가자 수',
    example: 6,
  })
  totalCount: number;
}

export class GetReservationMembersResponseDto {
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
    description: '예약 멤버 정보',
    type: ReservationMembersDataDto,
  })
  data: ReservationMembersDataDto;
}

/**
 * 예약정보 수정 api
 */
export class UpdateReservationRequestDto {
  @ApiProperty({
    description: '이벤트 제목',
    example: '오아시스를 직접 본다니',
    maxLength: 100,
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  title?: string;

  @ApiProperty({
    description: '예약 카테고리',
    example: '공연',
    enum: ['맛집', '액티비티', '공연', '운동경기', '기타'],
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['맛집', '액티비티', '공연', '운동경기', '기타'])
  category?: string;

  @ApiProperty({
    description: '예약 일시 (ISO8601 형식)',
    example: '2025-08-21T20:00:00+09:00',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  reservationDatetime?: string;

  @ApiProperty({
    description: '설명 내용',
    example: '1순위로 E열 선정하기. 만약에 안되면 H도 괜찮아요',
    required: false,
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({
    description: '외부 링크 URL',
    example: 'https://tickets.interpark.com/goods/12345',
    required: false,
  })
  @IsOptional()
  @IsUrl()
  linkUrl?: string;

  @ApiProperty({
    description: 'S3 이미지 URL 목록 (최대 3개)',
    example: ['path/image1.jpg', 'path/image1.jpg'],
    required: false,
    maxItems: 3,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  @IsUrl({}, { each: true })
  images?: string[];
}

export class UpdateReservationDataDto {
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
    example: '공연',
  })
  category: string;

  @ApiProperty({
    description: '수정된 예약 일시',
    example: '2025-08-21T20:00:00+09:00',
  })
  reservationDatetime: string;

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
    description: '수정된 이미지 URL 목록',
    example: ['path/image1.jpg', 'path/image1.jpg'],
  })
  images: string[];

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
    description: '최대 참가자 수',
    example: 6,
  })
  maxParticipants: number;

  @ApiProperty({
    description: '생성 시간',
    example: '2025-04-13T16:00:00Z',
  })
  createddAt: string;

  @ApiProperty({
    description: '수정 시간',
    example: '2025-06-13T16:00:00Z',
  })
  updatedAt: string;
}

export class UpdateReservationResponseDto {
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
    description: '수정된 예약 정보',
    type: UpdateReservationDataDto,
  })
  data: UpdateReservationDataDto;
}
