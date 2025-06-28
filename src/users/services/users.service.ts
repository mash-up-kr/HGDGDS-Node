import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../users.repository';
import { UpdateUserSettingsRequestDto } from '../dto/request/update-user-settings.request.dto';
import { UpdateUserSettingsResponseDto } from '../dto/response/update-user-settings.response';
import { GetMyInfoResponseDto } from '../dto/response/get-my-info.response.dto';
import { UserNotFoundException } from '@/common/exception/user.exception';
import { getProfileImagePath } from '@/common/enums/profile-image-code';
import { UserStatisticsService } from './user-statistics.service';
import { FilesService } from '@/files/files.service';
import { UpdateFcmTokenResponseDto } from '@/users/dto/response/update-fcm-token-response.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly userStatisticsService: UserStatisticsService,
    private readonly filesService: FilesService,
  ) {}

  async getMyInfo(userId: number): Promise<GetMyInfoResponseDto> {
    const user = await this.usersRepository.findUserById(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    const statistics =
      await this.userStatisticsService.getUserStatistics(userId);

    const filePath = getProfileImagePath(user.profileImageCode);
    const profileImageUrl =
      await this.filesService.getAccessPresignedUrl(filePath);

    return new GetMyInfoResponseDto(user, profileImageUrl, statistics);
  }

  async updateUserSettings(
    userId: number,
    updateDto: UpdateUserSettingsRequestDto,
  ): Promise<UpdateUserSettingsResponseDto> {
    const updatedUser = await this.usersRepository.updateUserSettings(
      userId,
      updateDto,
    );

    if (!updatedUser) {
      throw new UserNotFoundException();
    }

    const response = new UpdateUserSettingsResponseDto(updatedUser);
    return response;
  }

  async updateFcmToken(
    userId: number,
    fcmToken: string,
  ): Promise<UpdateFcmTokenResponseDto> {
    const user = await this.usersRepository.findUserById(userId);
    if (!user) {
      throw new UserNotFoundException();
    }

    await this.usersRepository.updateFcmToken(userId, fcmToken);
    user.fcmToken = fcmToken;
    const response = new UpdateFcmTokenResponseDto(user);
    return response;
  }
}
