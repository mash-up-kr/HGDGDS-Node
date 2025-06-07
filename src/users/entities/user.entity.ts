import { Entity, Column, Unique, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/entity/base.entity';
import { Reservation } from '@/reservations/entities/reservation.entity';
import { NotificationLog } from "@/notification-logs/entities/notification-log.entity";
import { ReservationResultEntity } from "@/reservations/entities/reservation-result.entity";
import { UserReservation } from "@/reservations/entities/user-reservation.entity";

export enum UserRole {
  HOST = 'HOST',
  GUEST = 'GUEST',
}

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

  @OneToMany(() => NotificationLog, log => log.senderUser)
  sentNotifications: NotificationLog[];

  @OneToMany(() => ReservationResultEntity, reservationResult => reservationResult.user)
  sharedReservationResults: ReservationResultEntity[];

  @OneToMany(() => UserReservation, userReservation => userReservation.user)
  participatedReservations: UserReservation[];
}
