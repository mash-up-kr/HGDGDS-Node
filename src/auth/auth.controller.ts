import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

import { CommonResponseDecorator } from '@/common/decorator/common.response.decorator';
import { Public } from '@/common/decorator/public.decorator';
import { AuthService } from './auth.service';
import { SignUpRequestDto } from './dto/request/sign-up.request.dto';
import { SignUpResponseDto } from './dto/response/sign-up.response';
import { ApiErrorResponse } from '@/common/decorator/api-error-response.decorator';
import { ValidationFailedException } from '@/common/exception/request-parsing.exception';

@ApiTags('인증')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '회원가입 및 로그인 ✅',
    description: '디바이스 ID와 닉네임으로 새로운 사용자를 등록합니다.',
  })
  @ApiBody({ type: SignUpRequestDto })
  @CommonResponseDecorator(SignUpResponseDto)
  @ApiErrorResponse(ValidationFailedException, '닉네임은 필수입니다.')
  async signUp(
    @Body() signUpDto: SignUpRequestDto,
  ): Promise<SignUpResponseDto> {
    return await this.authService.signUp(signUpDto);
  }
}
