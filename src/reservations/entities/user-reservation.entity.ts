import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@/common/entity/base.entity';
import { User } from '@/users/entities/user.entity';
import { Reservation } from '@/reservations/entities/reservation.entity';
import { UserReservationStatus } from "@/common/enums/user-reservation-status";

@Entity({ name: 'user_reservations' })
export class UserReservation extends BaseEntity {
    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Reservation)
    @JoinColumn({ name: 'reservation_id' })
    reservation: Reservation;

    @Column({
        type: 'enum',
        enum: UserReservationStatus,
        default: UserReservationStatus.DEFAULT,
    })
    status: UserReservationStatus;

    @Column({ name: 'status_message', nullable: true })
    statusMessage: string | null;
}
