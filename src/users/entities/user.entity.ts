import { Entity, Column, Unique, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/entity/base.entity';
import { Reservation } from '@/reservations/entities/reservation.entity';
import { NotificationLog } from "@/notification-logs/entities/notification-log.entity";
import { UserReservation } from "@/reservations/entities/user-reservation.entity";
import { UserRole } from "@/common/enums/user-role";

@Entity({ name: 'users' })
@Unique(['deviceId'])
export class User extends BaseEntity {
  @Column()
  nickname: string;

  @Column({ name: 'profile_url' })
  profileUrl: string;

  @Column({ name: 'device_id' })
  deviceId: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.GUEST,
  })
  role: UserRole;

  @Column({ name: 'reservation_alarm_setting', type: 'boolean', default: true })
  reservationAlarmSetting: boolean;

  @Column({ name: 'poke_alarm_setting', type: 'boolean', default: true })
  pokeAlarmSetting: boolean;

  @OneToMany(() => Reservation, reservation => reservation.host)
  hostedReservations: Reservation[];

  @OneToMany(() => NotificationLog, log => log.recipientUser)
  receivedNotifications: NotificationLog[];

  @OneToMany(() => UserReservation, userReservation => userReservation.user)
  participatedReservations: UserReservation[];
}
