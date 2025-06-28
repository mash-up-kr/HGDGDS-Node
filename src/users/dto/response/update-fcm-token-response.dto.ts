import { ApiProperty } from '@nestjs/swagger';
import { User } from '@/users/entities/user.entity';

export class UpdateFcmTokenResponseDto {
  @ApiProperty({
    description: '사용자 ID',
    example: 123,
  })
  userId: number;

  @ApiProperty({
    description: 'FCM 토큰',
    example: 'fcm_token_example',
  })
  fcmToken: string | null;

  constructor(user: User) {
    this.userId = user.id;
    this.fcmToken = user.fcmToken;
  }
}
