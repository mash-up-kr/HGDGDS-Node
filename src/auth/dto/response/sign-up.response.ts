import { ApiProperty } from '@nestjs/swagger';
import { ProfileImageCode } from '@/common/enums/profile-image-code';
import { User } from '@/users/entities/user.entity';

export class SignUpResponseDto {
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
    example: ProfileImageCode.IMG_001,
    enum: Object.values(ProfileImageCode),
  })
  profileImageCode: ProfileImageCode;

  @ApiProperty({
    description: '프로필 이미지 URL',
    example:
      'https://kr.object.ncloudstorage.com/app-images/assets/img_profile_01.png',
  })
  profileImageUrl: string;

  @ApiProperty({
    description: '계정 생성 시간',
    example: '2024-06-03T10:00:00Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'JWT 액세스 토큰',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  constructor(user: User, accessToken: string, profileImageUrl: string) {
    this.userId = user.id;
    this.deviceId = user.deviceId;
    this.nickname = user.nickname;
    this.profileImageCode = user.profileImageCode;
    this.profileImageUrl = profileImageUrl;
    this.createdAt = user.createdAt.toISOString();
    this.accessToken = accessToken;
  }
}
