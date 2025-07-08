import { Entity, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BaseEntity } from '@/common/entity/base.entity';
import { Reservation } from '@/reservations/entities/reservation.entity';
import { User } from '@/users/entities/user.entity';
import { ReservationResultStatus } from '@/common/enums/reservation-result-status';

@Entity({ name: 'reservation_results' })
@Unique(['user', 'reservation'])
export class ReservationResult extends BaseEntity {
  @ManyToOne(() => Reservation)
  @JoinColumn({ name: 'reservation_id' })
  reservation: Reservation;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    enum: ReservationResultStatus,
    default: ReservationResultStatus.SUCCESS,
  })
  status: ReservationResultStatus;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'success_datetime', type: 'timestamp', nullable: true })
  successDatetime: Date | null;
}
