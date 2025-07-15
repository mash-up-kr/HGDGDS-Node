import { ProfileImageCode } from '@/common/enums/profile-image-code';
import { ApiProperty } from '@nestjs/swagger';

export class ProfileImageCodeDto {
  @ApiProperty({
    description: '프로필 이미지 코드',
    enum: ProfileImageCode,
    example: ProfileImageCode.PURPLE,
  })
  profileImageCode: ProfileImageCode;

  @ApiProperty({
    description: '프로필 이미지 조회 presigned URL',
    example: 'http://abced',
  })
  imageUrl: string;

  constructor(code: ProfileImageCode, url: string) {
    this.profileImageCode = code;
    this.imageUrl = url;
  }
}
