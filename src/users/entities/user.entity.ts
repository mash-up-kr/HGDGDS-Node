import { Entity, Column, Unique } from 'typeorm';
import { BaseEntity } from '@/common/entity/base.entity';
import { UserRole } from '@/common/enums/user-role';
import { ProfileImageCode } from '@/common/enums/profile-image-code';

@Entity({ name: 'users' })
@Unique(['deviceId'])
export class User extends BaseEntity {
  @Column()
  nickname: string;

  @Column({
    name: 'profile_image_name',
    type: 'enum',
    enum: ProfileImageCode,
    nullable: false,
  })
  profileImageCode: ProfileImageCode;

  @Column({ name: 'device_id' })
  deviceId: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({ name: 'reservation_alarm_setting', type: 'boolean', default: true })
  reservationAlarmSetting: boolean;

  @Column({ name: 'kok_alarm_setting', type: 'boolean', default: true })
  kokAlarmSetting: boolean;
}
