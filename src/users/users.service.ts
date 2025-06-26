import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UpdateUserSettingsRequestDto } from './dto/request/update-user-settings.dto';
import { UpdateUserSettingsResponseDto } from './dto/response/update-user-settings.response';
import { UserNotFoundException } from '@/common/exception/user.exception';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async updateUserSettings(
    userId: number,
    updateDto: UpdateUserSettingsRequestDto,
  ): Promise<UpdateUserSettingsResponseDto> {
    const existingUser = await this.usersRepository.findUserById(userId);

    if (!existingUser) {
      throw new UserNotFoundException();
    }

    const updatedUser = await this.usersRepository.updateUserSettings(
      userId,
      updateDto,
    );

    return new UpdateUserSettingsResponseDto(updatedUser);
  }
}
