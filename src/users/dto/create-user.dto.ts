import { ProfileImageCode } from '@/common/enums/profile-image-code';

export class CreateUserDto {
  deviceId: string;
  nickname: string;
  profileImageCode: ProfileImageCode;

  constructor(
    deviceId: string,
    nickname: string,
    profileImageCode: ProfileImageCode,
  ) {
    this.deviceId = deviceId;
    this.nickname = nickname;
    this.profileImageCode = profileImageCode;
  }
}
