import { ApiProperty } from '@nestjs/swagger';
import { User } from '@/users/entities/user.entity';
import { ProfileImageCode } from '@/common/enums/profile-image-code';

export class UpdateUserSettingsResponseDto {
  @ApiProperty({
    description: '사용자 ID',
    example: 123,
  })
  userId: number;

  @ApiProperty({
    description: '디바이스 고유 식별자',
    example: 'iPhone_ABC123XYZ',
  })
  deviceId: string;

  @ApiProperty({
    description: '사용자 닉네임',
    example: '새로운닉네임',
  })
  nickname: string;

  @ApiProperty({
    description: '프로필 이미지 코드',
    enum: ProfileImageCode,
    example: ProfileImageCode.PURPLE,
  })
  profileImageCode: ProfileImageCode;

  @ApiProperty({
    description: '예약 알림 수신 설정',
    example: false,
  })
  reservationAlarmSetting: boolean;

  @ApiProperty({
    description: '콕찌르기 알림 수신 설정',
    example: true,
  })
  kokAlarmSetting: boolean;

  @ApiProperty({
    description: '설정 변경 시각',
    example: '2025-08-21T20:00:00+09:00',
  })
  updatedAt: Date;

  constructor(user: User) {
    this.userId = user.id;
    this.deviceId = user.deviceId;
    this.nickname = user.nickname;
    this.profileImageCode = user.profileImageCode;
    this.reservationAlarmSetting = user.reservationAlarmSetting;
    this.kokAlarmSetting = user.kokAlarmSetting;
    this.updatedAt = user.updatedAt;
  }
}
