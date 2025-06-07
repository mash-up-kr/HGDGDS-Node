import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@/common/entity/base.entity';
import { User } from '@/users/entities/user.entity';
import { Reservation } from '@/reservations/entities/reservation.entity';

export enum UserReservationStatus {
    DEFAULT = '기본',
    READY = '준비완료',
    FAIL = '실패',
    SUCCESS = '성공',
}

@Entity({ name: 'user_reservations' })
export class UserReservation extends BaseEntity {
    @ManyToOne(() => User, user => user.participatedReservations)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Reservation, reservation => reservation.userReservations)
    @JoinColumn({ name: 'reservation_id' })
    reservation: Reservation;

    @Column({
        type: 'enum',
        enum: UserReservationStatus,
        default: UserReservationStatus.DEFAULT,
    })
    status: UserReservationStatus;

    @Column({ name: 'status_message', nullable: true })
    statusMessage?: string;
}