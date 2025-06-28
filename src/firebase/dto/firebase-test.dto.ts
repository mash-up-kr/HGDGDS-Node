import { ApiProperty } from '@nestjs/swagger';

export class FcmTestDto {
  @ApiProperty({
    description: 'FCM 토큰',
    example: 'dA1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6q7R8s9T0u1V2w3X4y5Z6a7B8c9D0e1F',
  })
  token: string;
}
