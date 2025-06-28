import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FcmTestDto {
  @ApiProperty({
    description: 'FCM 토큰',
    example: 'dA1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6q7R8s9T0u1V2w3X4y5Z6a7B8c9D0e1F',
  })
  @IsNotEmpty({ message: 'FCM 토큰은 필수입니다' })
  @IsString({ message: 'FCM 토큰은 문자열이어야 합니다' })
  token: string;
}
