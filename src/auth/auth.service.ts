import { JwtPayload } from '@/common';
import { UsersRepository } from '@/users/users.repository';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UsersRepository,
    private readonly jwtModule: JwtService,
  ) {}

  private async issueAccessToken(payload: JwtPayload) {
    return await this.jwtModule.signAsync(payload, {
      secret: process.env.JWT_SECRET ?? '',
      expiresIn: process.env.JWT_EXPIRES_IN ?? '6h',
    });
  }
}
