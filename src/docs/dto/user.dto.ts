import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length } from 'class-validator';

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
