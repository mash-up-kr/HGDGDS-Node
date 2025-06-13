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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CheckNicknameQueryDto, CheckNicknameResponseDto, GetMyInfoResponseDto, UpdateUserSettingsRequestDto, UpdateUserSettingsResponseDto } from '../docs/dto/user.dto';
import { ErrorResponseDto } from '@/common/dto/response/error-response.dto';
import { GlobalAuthGuard } from '@/common/guard/global-auth.guard';


@ApiTags('사용자')
@UseGuards(GlobalAuthGuard)
@Controller('users')
export class UsersController {
  @Get('me')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '내 정보 조회',
    description: '현재 로그인한 사용자의 정보와 통계를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '사용자 정보 조회 성공',
    type: GetMyInfoResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 사용자',
    type: ErrorResponseDto,
    example: {
      code: '1003',
      message: '유효하지 않은 토큰입니다.'
    }
  })
  @ApiResponse({
    status: 404,
    description: '사용자를 찾을 수 없음',
    type: ErrorResponseDto,
    example: {
      code: '1000',
      message: '찾을 수 없는 유저입니다.'
    }
  })
  async getMyInfo(): Promise<GetMyInfoResponseDto> {
    // TODO: 실제 서비스 로직 구현
    // - JWT에서 사용자 ID 추출
    // - 사용자 정보 조회
    // - 예약 통계 계산 (총 예약 수, 성공 예약 수, 성공률)
    
    return {
      code: '200',
      message: 'OK',
      data: {
        userId: 123,
        nickname: '남아라 병아리',
        imageKind: '01',
        statistics: {
          totalReservations: 3,
          successReservations: 2,
          successRate: 90,
        },
        reservationAlarmSetting: true,
        kokAlarmSetting: true,
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-06-03T15:30:00Z',
      }
    };
  }
  
  @Get('check-nickname')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '닉네임 중복 체크',
    description: '닉네임 사용 가능 여부를 확인합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '닉네임 중복 체크 결과',
    type: CheckNicknameResponseDto,
    examples: {
      available: {
        summary: '사용 가능한 닉네임',
        value: {
          code: '200',
          message: 'OK',
          data: {
            nickname: '김철수',
            available: true
          }
        }
      },
      unavailable: {
        summary: '이미 사용 중인 닉네임',
        value: {
          code: '200',
          message: 'OK',
          data: {
            nickname: '김철수',
            available: false
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (닉네임 형식 오류)',
    type: ErrorResponseDto,
    example: {
      code: '1004',
      message: '닉네임 형식이 올바르지 않습니다.'
    }
  })
  async checkNickname(@Query() query: CheckNicknameQueryDto): Promise<CheckNicknameResponseDto> {
    // TODO: 실제 서비스 로직 구현 (DB에서 닉네임 중복 확인)
    const isAvailable = Math.random() > 0.5; // 임시 랜덤 로직
    
    return {
      code: '200',
      message: 'OK',
      data: {
        nickname: query.nickname,
        available: isAvailable,
      }
    };
  }

  @Patch('me')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: '내 설정 변경',
    description: '닉네임, 프로필 이미지, 예약 알림 설정, 콕찌르기 알림 설정을 변경합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '사용자 설정 변경 성공',
    type: UpdateUserSettingsResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (닉네임 중복, 유효하지 않은 값 등)',
    type: ErrorResponseDto,
    example: {
      code: '1005',
      message: '이미 사용 중인 닉네임입니다.'
    }
  })
  @ApiResponse({
    status: 401,
    description: '인증되지 않은 사용자',
    type: ErrorResponseDto,
    example: {
      code: '1003',
      message: '유효하지 않은 토큰입니다.'
    }
  })
  @ApiResponse({
    status: 404,
    description: '사용자를 찾을 수 없음',
    type: ErrorResponseDto,
    example: {
      code: '1000',
      message: '찾을 수 없는 유저입니다.'
    }
  })
  async updateMySettings(@Body() updateDto: UpdateUserSettingsRequestDto): Promise<UpdateUserSettingsResponseDto> {
   
    
    return {
      code: '200',
      message: 'OK',
      data: {
        userId: 123,
        deviceId: 'iPhone_ABC123XYZ',
        nickname: updateDto.nickname || '기존닉네임', // 기본값 처리
        profileImageName: updateDto.imageKind ? `IMG_00${updateDto.imageKind}` : 'IMG_001', // 이미지 변경 처리
        reservationAlarmSetting: updateDto.reservationAlarmSetting ?? true, // null 병합 연산자
        kokAlarmSetting: updateDto.kokAlarmSetting ?? true,
        updatedAt: new Date().toISOString(),
      }
    };
  }
}