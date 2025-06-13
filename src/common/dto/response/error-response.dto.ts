import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({
    description: '에러 코드',
    example: '1000',
  })
  code: string;

  @ApiProperty({
    description: '에러 메시지',
    example: '찾을 수 없는 유저입니다',
  })
  message: string;
}
