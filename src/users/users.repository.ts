import { OrderCondition } from '@/common';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  DataSource,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  IsNull,
  Repository,
} from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserSettingsRequestDto } from './dto/request/update-user-settings.request.dto';

@Injectable()
export class UsersRepository extends Repository<User> {
  private saltRound: number = 10;

  constructor(private readonly dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  /**
   * 사용자 설정 업데이트 (요청으로 온 필드만 업데이트.)
   */
  async updateUserSettings(
    userId: number,
    updateData: UpdateUserSettingsRequestDto,
  ): Promise<User | null> {
    const user = await this.findUserById(userId);
    if (!user) {
      return null;
    }

    const {
      nickname,
      profileImageCode,
      reservationAlarmSetting,
      kokAlarmSetting,
    } = updateData;

    Object.assign(user, {
      ...(nickname !== undefined && { nickname }),
      ...(profileImageCode !== undefined && { profileImageCode }),
      ...(reservationAlarmSetting !== undefined && { reservationAlarmSetting }),
      ...(kokAlarmSetting !== undefined && { kokAlarmSetting }),
      updatedAt: new Date(),
    });

    return await this.save(user);
  }

  public async encryptPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRound);
  }

  public async validatePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async findUserByDeviceId(deviceId: string): Promise<User | null> {
    return await this.findOne({
      where: {
        deviceId,
        deletedAt: IsNull(),
      },
    });
  }

  async createUser(userData: CreateUserDto): Promise<User> {
    const user = this.create({
      deviceId: userData.deviceId,
      nickname: userData.nickname,
      profileImageCode: userData.profileImageCode,
    });

    return await this.save(user);
  }

  async listUser(
    offset: number,
    limit: number,
    order: OrderCondition,
    whereOptions: FindOptionsWhere<User>,
    selectOptions?: FindOptionsSelect<User>,
  ): Promise<{
    users: User[];
    count: number;
  }> {
    const [users, count] = await this.findAndCount({
      where: whereOptions,
      skip: offset,
      take: limit,
      select: selectOptions,
    });
    return { users, count };
  }

  async findUser(
    whereOptions: FindOptionsWhere<User>,
    relations?: FindOptionsRelations<User>,
    selectOptions?: FindOptionsSelect<User>,
  ) {
    return await this.findOne({
      where: whereOptions,
      relations: relations,
      select: selectOptions,
    });
  }

  async findUserById(
    id: number,
    selectOptions?: FindOptionsSelect<User>,
  ): Promise<User | null> {
    return await this.findOne({
      where: { id },
      select: selectOptions,
    });
  }
}
