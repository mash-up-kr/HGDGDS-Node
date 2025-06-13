import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

import { ApiSuccessResponse } from '@/common/decorator/api-success-response.decorator';
import { ErrorResponseDto } from '@/common/dto/response/error-response.dto';
import { SignUpRequestDto, SignUpResponseDto } from '../docs/dto/auth.dto';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '회원가입',
    description: '디바이스 ID와 닉네임으로 새로운 사용자를 등록합니다.',
  })
  @ApiBody({ type: SignUpRequestDto })
  @ApiSuccessResponse(SignUpResponseDto, {
    status: 201,
    description: '회원가입 성공',
    headers: {
      Authorization: {
        description: 'JWT 토큰',
        schema: {
          type: 'string',
          example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      '잘못된 요청 (중복된 디바이스 ID, 유효하지 않은 이미지 종류 등)',
    type: ErrorResponseDto,
    example: {
      code: '1001',
      message: '이미 등록된 디바이스입니다.',
    },
  })
  @ApiResponse({
    status: 422,
    description: '유효성 검사 실패',
    type: ErrorResponseDto,
    example: {
      code: '1002',
      message: '닉네임은 필수입니다.',
    },
  })
  signUp(@Body() signUpDto: SignUpRequestDto): SignUpResponseDto {
    return {
      code: '200',
      message: 'OK',
      data: {
        userId: 123,
        deviceId: signUpDto.deviceId,
        nickname: signUpDto.nickname,
        profileImageName: `IMG_00${signUpDto.profileImageCode}`,
        createdAt: new Date().toISOString(),
      },
    };
  }
}
