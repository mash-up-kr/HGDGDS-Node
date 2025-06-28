import { Body, Controller, Post } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { FcmTestDto } from '@/firebase/dto/firebase-test.dto';

@ApiTags('firebase')
@Controller('firebase')
export class FirebaseController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Post('test')
  @ApiOperation({ summary: 'FCM 테스트 알림 전송' })
  @ApiBody({ type: FcmTestDto })
  @ApiResponse({ status: 200, description: '알림 전송 성공' })
  async sendTestNotification(@Body() dto: FcmTestDto) {
    return await this.firebaseService.sendNotification(
      dto.token,
      'FCM 테스트 알림',
      '테스트 알림이 성공적으로 전송되었습니다',
      '',
    );
  }
}
