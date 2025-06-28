import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFcmTokenDto {
  @ApiProperty({
    description: 'FCM 토큰',
    example: 'fcmTokenExample',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  fcmToken: string;
}
