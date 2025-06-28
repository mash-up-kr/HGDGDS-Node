import { ProfileImageCode } from '@/common/enums/profile-image-code';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';

export class SignUpRequestDto {
  @ApiProperty({
    description: '디바이스 고유 식별자',
    example: 'phone_ABC123XYZ',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  deviceId: string;

  @ApiProperty({
    description: '사용자 닉네임',
    example: '김매셥',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  nickname: string;

  @ApiProperty({
    description: '프로필 이미지 코드',
    example: ProfileImageCode.IMG_001,
    enum: Object.values(ProfileImageCode),
  })
  @IsEnum(ProfileImageCode, {
    message: 'profileImageCode는 유효한 프로필 이미지여야 합니다.',
  })
  profileImageCode: ProfileImageCode;
}
