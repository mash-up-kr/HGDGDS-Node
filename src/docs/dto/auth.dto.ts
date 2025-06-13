import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, Length } from 'class-validator';

export class SignUpRequestDto {
  @ApiProperty({
    description: '디바이스 고유 식별자',
    example: 'iPhone_ABC123XYZ',
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  deviceId: string;

  @ApiProperty({
    description: '사용자 닉네임',
    example: '김철수',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  nickname: string;

  @ApiProperty({
    description: '프로필 이미지 종류 (01-05)',
    example: '01',
    enum: ['01', '02', '03', '04', '05'],
  })
  @IsString()
  @Matches(/^0[1-5]$/, {
    message: 'imageKind는 01부터 05까지의 값이어야 합니다.',
  })
  imageKind: string;
}

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
    description: '프로필 이미지 파일명',
    example: 'IMG_001',
  })
  profileImageName: string;

  @ApiProperty({
    description: '계정 생성 시간',
    example: '2024-06-03T10:00:00Z',
  })
  createdAt: string;
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
}
