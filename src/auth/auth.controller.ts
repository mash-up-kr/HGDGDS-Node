import { AuthService } from '@/auth/auth.service';
import { AuthSignInDto, AuthSignUpDto } from '@/auth/dto/request';
import { AuthTokenResponse } from '@/auth/dto/response';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
}
