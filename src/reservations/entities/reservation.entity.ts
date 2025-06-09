import {Entity, Column, ManyToOne, JoinColumn, OneToMany} from "typeorm";
import { BaseEntity } from "@/common/entity/base.entity";
import { User } from "@/users/entities/user.entity";
import { SimilarGroup } from "@/similar-groups/entities/similar-groups.entity";
import { ReservationResultEntity } from "@/reservations/entities/reservation-result.entity";
import { UserReservation } from "@/reservations/entities/user-reservation.entity";
import { ReservationCategory } from "@/common/enums/reservation-category";

@Entity({ name: "reservations" })
export class Reservation extends BaseEntity {
    @Column()
    title: string;

    @Column({ type: "enum", enum: ReservationCategory })
    category: ReservationCategory;

    @Column()
    reservationDatetime: Date;

    @Column({ nullable: true })
    description?: string;

    @Column({ nullable: true })
    linkUrl?: string;

    @ManyToOne(() => User, user => user.hostedReservations)
    @JoinColumn({ name: "host_id" })
    host: User;

    @ManyToOne(() => SimilarGroup, group => group.reservations)
    @JoinColumn({ name: "similar_group_id" })
    similarGroup: SimilarGroup;

    @OneToMany(() => ReservationResultEntity, reservationResult => reservationResult.reservation)
    results: ReservationResultEntity[];

    @OneToMany(() => UserReservation, userReservation => userReservation.reservation)
    userReservations: UserReservation[];
}
