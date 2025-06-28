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
      '콕 찌르기가 활성화 되었어요!',
      '콕 찔러서 친구들에게 알림을 보내보세요',
      '',
    );
  }
}
