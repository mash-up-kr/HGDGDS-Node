import { JwtPayload } from '@/common';

import { UsersRepository } from '@/users/users.repository';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignUpRequestDto } from './dto/request/sign-up.request.dto';
import { SignUpResponseDto } from './dto/response/sign-up.response';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { getProfileImageUrl } from '@/common/enums/profile-image-code';

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

  async signUp(signUpDto: SignUpRequestDto): Promise<SignUpResponseDto> {
    const { deviceId, nickname, profileImageCode } = signUpDto;

    let user = await this.userRepository.findUserByDeviceId(deviceId);

    if (!user) {
      const createUserDto = new CreateUserDto(
        deviceId,
        nickname,
        profileImageCode,
      );
      user = await this.userRepository.createUser(createUserDto);
    }

    const payload: JwtPayload = {
      id: user.id,
      role: user.role,
    };
    const accessToken = await this.issueAccessToken(payload);

    const profileImageUrl = getProfileImageUrl(user.profileImageCode);

    return new SignUpResponseDto(user, accessToken, profileImageUrl);
  }
}
