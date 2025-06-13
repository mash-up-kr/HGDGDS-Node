import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@/common/entity/base.entity';
import { Reservation } from '@/reservations/entities/reservation.entity';
import { User } from '@/users/entities/user.entity';

@Entity({ name: 'reservation_results' })
export class ReservationResultEntity extends BaseEntity {
  @ManyToOne(() => Reservation)
  @JoinColumn({ name: 'reservation_id' })
  reservation: Reservation;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'is_success', type: 'boolean' })
  isSuccess: boolean;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'success_datetime', type: 'timestamp', nullable: true })
  successDatetime: Date | null;
}
