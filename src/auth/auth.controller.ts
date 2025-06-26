import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

import { ErrorResponseDto } from '@/common/dto/response/error-response.dto';

import { CommonResponseDecorator } from '@/common/decorator/common.response.decorator';
import { Public } from '@/common/decorator/public.decorator';
import { AuthService } from './auth.service';
import { SignUpRequestDto } from './dto/request/sign-up.request.dto';
import {
  SignUpDataDto,
  SignUpResponseDto,
} from './dto/response/sign-up.response';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '회원가입 및 로그인',
    description: '디바이스 ID와 닉네임으로 새로운 사용자를 등록합니다.',
  })
  @ApiBody({ type: SignUpRequestDto })
  @CommonResponseDecorator(SignUpDataDto)
  @ApiResponse({
    status: 422,
    description: '유효성 검사 실패',
    type: ErrorResponseDto,
    example: {
      code: '1002',
      message: '닉네임은 필수입니다.',
    },
  })
  async signUp(
    @Body() signUpDto: SignUpRequestDto,
  ): Promise<SignUpResponseDto> {
    return await this.authService.signUp(signUpDto);
  }
}
