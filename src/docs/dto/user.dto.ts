import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length, IsBoolean, IsOptional, Matches } from 'class-validator';

/**
 * 유저 정보
 */
export class UserStatisticsDto {
  @ApiProperty({
    description: '총 예약 수',
    example: 3,
  })
  totalReservations: number;

  @ApiProperty({
    description: '성공한 예약 수',
    example: 2,
  })
  successReservations: number;

  @ApiProperty({
    description: '성공률 (%)',
    example: 90,
  })
  successRate: number;
}

export class GetMyInfoDataDto {
  @ApiProperty({
    description: '사용자 ID',
    example: 123,
  })
  userId: number;

  @ApiProperty({
    description: '사용자 닉네임',
    example: '날아라 병아리',
  })
  nickname: string;

  @ApiProperty({
    description: '프로필 이미지 종류',
    example: '01',
  })
  imageKind: string;

  @ApiProperty({
    description: '예약 통계',
    type: UserStatisticsDto,
  })
  statistics: UserStatisticsDto;

  @ApiProperty({
    description: '예약 알림 수신 설정',
    example: true,
  })
  reservationAlarmSetting: boolean;

  @ApiProperty({
    description: '콕찌르기 알림 수신 설정',
    example: true,
  })
  kokAlarmSetting: boolean;

  @ApiProperty({
    description: '계정 생성 시간',
    example: '2024-01-15T10:00:00Z',
  })
  createdAt: string;

  @ApiProperty({
    description: '마지막 업데이트 시간',
    example: '2024-06-03T15:30:00Z',
  })
  updatedAt: string;
}

export class GetMyInfoResponseDto {
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
    description: '사용자 정보',
    type: GetMyInfoDataDto,
  })
  data: GetMyInfoDataDto;
}
/**
 * 유저 세팅 수정
 */
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
    description: '프로필 이미지 종류 (01-05)',
    example: '03',
    enum: ['01', '02', '03', '04', '05'],
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^0[1-5]$/, {
    message: 'imageKind는 01부터 05까지의 값이어야 합니다.',
  })
  imageKind?: string;

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

export class UpdateUserSettingsDataDto {
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
    description: '프로필 이미지 파일명',
    example: 'IMG_001',
  })
  profileImageName: string;

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
    description: '설정 변경 시간',
    example: '2024-06-03T15:30:00Z',
  })
  updatedAt: string;
}

export class UpdateUserSettingsResponseDto {
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
    description: '변경된 사용자 설정 정보',
    type: UpdateUserSettingsDataDto,
  })
  data: UpdateUserSettingsDataDto;
}

export class CheckNicknameQueryDto {
  @ApiProperty({
    description: '중복 체크할 닉네임',
    example: '김철수',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  nickname: string;
}

/**
 * 닉네임 중복 체크
 */
export class CheckNicknameDataDto {
  @ApiProperty({
    description: '체크한 닉네임',
    example: '김철수',
  })
  nickname: string;

  @ApiProperty({
    description: '사용 가능 여부',
    example: true,
  })
  available: boolean;
}

export class CheckNicknameResponseDto {
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
    description: '닉네임 중복 체크 결과',
    type: CheckNicknameDataDto,
  })
  data: CheckNicknameDataDto;
}