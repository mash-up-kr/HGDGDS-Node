import { ProfileImageCode } from '@/common/enums/profile-image-code';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, Length } from 'class-validator';

export class UpdateUserSettingsRequestDto {
  @ApiProperty({
    description: '변경할 닉네임',
    example: '새로운닉네임',
    maxLength: 50,
    required: false,
  })
  @IsString()
  @IsOptional()
  @Length(1, 50)
  nickname?: string;

  @ApiProperty({
    description: '프로필 이미지 코드',
    example: ProfileImageCode.IMG_001,
    enum: Object.values(ProfileImageCode),
  })
  @IsString()
  @IsOptional()
  profileImageCode?: string;

  @ApiProperty({
    description: '예약 알림 수신 설정',
    example: false,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  reservationAlarmSetting?: boolean;

  @ApiProperty({
    description: '콕찌르기 알림 수신 설정',
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  kokAlarmSetting?: boolean;
}
