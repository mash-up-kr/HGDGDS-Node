import { Body, Controller, Post } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { FcmTestDto } from '@/firebase/dto/firebase-test.dto';
import { CommonResponseDecorator } from '@/common/decorator/common.response.decorator';
import { ApiErrorResponse } from '@/common/decorator/api-error-response.decorator';
import { InvalidFcmTokenException } from '@/firebase/exception/firebase.exception';

@ApiTags('firebase')
@Controller('firebase')
export class FirebaseController {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Post('test')
  @ApiOperation({ summary: 'FCM 테스트 알림 전송 ✅' })
  @ApiBody({ type: FcmTestDto })
  @ApiErrorResponse(InvalidFcmTokenException)
  @CommonResponseDecorator()
  async sendTestNotification(@Body() dto: FcmTestDto) {
    return await this.firebaseService.sendNotification(
      dto.token,
      'FCM 테스트 알림',
      '테스트 알림이 성공적으로 전송되었습니다',
      '',
    );
  }
}
