import { ApiProperty } from '@nestjs/swagger';
import { User } from '@/users/entities/user.entity';
import { ProfileImageCode } from '@/common/enums/profile-image-code';

export class SignUpDataDto {
  @ApiProperty({
    description: '생성된 사용자 ID',
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
    example: '김철수',
  })
  nickname: string;

  @ApiProperty({
    description: '프로필 이미지 코드',
    example: ProfileImageCode.IMG_001, // 예시값 변경
    enum: Object.values(ProfileImageCode), // enum 추가
  })
  profileImageCode: ProfileImageCode; // 타입 변경: string → ProfileImageCode

  @ApiProperty({
    description: '계정 생성 시간',
    example: '2024-06-03T10:00:00Z',
  })
  createdAt: string;

  constructor(user: User) {
    this.userId = user.id;
    this.deviceId = user.deviceId;
    this.nickname = user.nickname;
    this.profileImageCode = user.profileImageCode;
    this.createdAt = user.createdAt.toISOString();
  }
}

export class SignUpResponseDto {
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
    description: '회원가입 결과 데이터',
    type: SignUpDataDto,
  })
  data: SignUpDataDto;

  @ApiProperty({
    description: 'JWT 액세스 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string; // JWT 토큰 필드 추가

  constructor(user: User, accessToken: string) {
    this.code = '200';
    this.message = 'OK';
    this.data = new SignUpDataDto(user);
    this.accessToken = accessToken;
  }
}
