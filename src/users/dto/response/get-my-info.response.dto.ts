import { ApiProperty } from '@nestjs/swagger';
import { User } from '@/users/entities/user.entity';
import { ProfileImageCode } from '@/common/enums/profile-image-code';

export class UserStatisticsDto {
  @ApiProperty({
    description: '총 예약 수',
    example: 5,
  })
  totalReservations: number;

  @ApiProperty({
    description: '성공한 예약 수',
    example: 3,
  })
  successReservations: number;

  @ApiProperty({
    description: '예약 성공률 (백분율)',
    example: 60,
  })
  successRate: number;

  constructor(totalReservations: number, successReservations: number) {
    this.totalReservations = totalReservations;
    this.successReservations = successReservations;
    this.successRate =
      totalReservations > 0
        ? Math.round((successReservations / totalReservations) * 100)
        : 0;
  }
}

export class GetMyInfoResponseDto {
  @ApiProperty({
    description: '사용자 ID',
    example: 123,
  })
  userId: number;

  @ApiProperty({
    description: '사용자 닉네임',
    example: '김철수',
  })
  nickname: string;

  @ApiProperty({
    description: '프로필 이미지 코드',
    example: ProfileImageCode.PURPLE,
    enum: ProfileImageCode,
  })
  profileImageCode: ProfileImageCode;

  @ApiProperty({
    description: '프로필 이미지 URL',
    example:
      'https://kr.object.ncloudstorage.com/app-images/assets/img_profile_01.png',
  })
  profileImageUrl: string;

  @ApiProperty({
    description: '사용자 통계',
    type: UserStatisticsDto,
  })
  statistics: UserStatisticsDto;

  @ApiProperty({
    description: '예약 알림 설정',
    example: true,
  })
  reservationAlarmSetting: boolean;

  @ApiProperty({
    description: '콕찌르기 알림 설정',
    example: true,
  })
  kokAlarmSetting: boolean;

  @ApiProperty({
    description: '계정 생성 시간',
    example: '2024-06-03T10:00:00Z',
  })
  createdAt: string;

  @ApiProperty({
    description: '마지막 업데이트 시간',
    example: '2024-06-27T15:30:00Z',
  })
  updatedAt: string;

  constructor(
    user: User,
    profileImageUrl: string,
    statistics: UserStatisticsDto,
  ) {
    this.userId = user.id;
    this.nickname = user.nickname;
    this.profileImageCode = user.profileImageCode;
    this.profileImageUrl = profileImageUrl;
    this.statistics = statistics;
    this.reservationAlarmSetting = user.reservationAlarmSetting;
    this.kokAlarmSetting = user.kokAlarmSetting;
    this.createdAt = user.createdAt.toISOString();
    this.updatedAt = user.updatedAt.toISOString();
  }
}
