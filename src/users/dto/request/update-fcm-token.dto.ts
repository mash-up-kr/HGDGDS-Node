import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFcmTokenDto {
  @ApiProperty({
    description: 'FCM 토큰',
    example: 'fcm_token_example',
    required: true,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  fcmToken: string;
}
