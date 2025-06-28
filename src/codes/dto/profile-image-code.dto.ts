import { ProfileImageCode } from '@/common/enums/profile-image-code';
import { ApiProperty } from '@nestjs/swagger';

export class ProfileImageCodeDto {
  @ApiProperty({
    description: '코드 이름',
    enum: ProfileImageCode,
  })
  profileImageCodeName: ProfileImageCode;

  @ApiProperty({
    description: '프로필 이미지 조회 presigned URL',
    example: 'http://abced',
  })
  imageUrl: string;

  constructor(code: ProfileImageCode, url: string) {
    this.profileImageCodeName = code;
    this.imageUrl = url;
  }
}
