import {
  Controller,
  Get,
  Query,
  HttpCode,
  HttpStatus,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  CheckNicknameQueryDto,
  CheckNicknameResponseDto,
} from '../docs/dto/user.dto';
import { ErrorResponseDto } from '@/common/dto/response/error-response.dto';
import { CommonResponseDecorator } from '@/common/decorator/common.response.decorator';
import { User } from './entities/user.entity';
import { UsersService } from './services/users.service';
import { UpdateUserSettingsRequestDto } from './dto/request/update-user-settings.request.dto';
import { UpdateUserSettingsResponseDto } from './dto/response/update-user-settings.response';
import { GetMyInfoResponseDto as MyInfoResponseDto } from './dto/response/get-my-info.response.dto';
import { CurrentUser } from '@/common/decorator/current-user.decorator';
import { GlobalAuthGuard } from '@/common/guard/global-auth.guard';
import { Roles } from '@/common/decorator/roles.decorator';
import { UserRole } from '@/common/enums/user-role';
import { ApiAuth } from '@/common/decorator/api.auth.decorator';
import { ApiErrorResponse } from '@/common/decorator/api-error-response.decorator';
import { InvalidTokenException } from '@/common/exception/auth.exception';
import { UserNotFoundException } from '@/common/exception/user.exception';
import { UpdateFcmTokenDto } from '@/users/dto/request/update-fcm-token.dto';
import { UpdateFcmTokenResponseDto } from '@/users/dto/response/update-fcm-token-response.dto';

@ApiTags('사용자')
@Controller('users')
@Roles(UserRole.USER)
@UseGuards(GlobalAuthGuard)
@ApiAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '내 정보 조회 ✅',
    description: '현재 로그인한 사용자의 정보와 통계를 조회합니다.',
  })
  @CommonResponseDecorator(MyInfoResponseDto)
  @ApiErrorResponse(UserNotFoundException)
  async getMyInfo(@CurrentUser() user: User): Promise<MyInfoResponseDto> {
    return await this.usersService.getMyInfo(user.id);
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '내 설정 변경 ✅',
    description:
      '닉네임, 프로필 이미지, 예약 알림 설정, 콕찌르기 알림 설정을 변경합니다. 변경이 필요한 필드만 전송하면 됩니다.',
  })
  @ApiErrorResponse(InvalidTokenException)
  @ApiErrorResponse(UserNotFoundException)
  @CommonResponseDecorator(UpdateUserSettingsResponseDto)
  async updateMySettings(
    @Body() updateDto: UpdateUserSettingsRequestDto,
    @CurrentUser() user: User,
  ): Promise<UpdateUserSettingsResponseDto> {
    return await this.usersService.updateUserSettings(user.id, updateDto);
  }

  @Patch('fcm-token')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'FCM 토큰 업데이트 ✅',
    description:
      '클라이언트로부터 FCM 토큰을 받아 사용자의 FCM 토큰을 업데이트합니다.',
  })
  @ApiErrorResponse(InvalidTokenException)
  @ApiErrorResponse(UserNotFoundException)
  @CommonResponseDecorator(UpdateFcmTokenResponseDto)
  async updateFcmToken(
    @Body() updateFcmTokenDto: UpdateFcmTokenDto,
    @CurrentUser() user: User,
  ): Promise<UpdateFcmTokenResponseDto> {
    return await this.usersService.updateFcmToken(
      user.id,
      updateFcmTokenDto.fcmToken,
    );
  }
}
