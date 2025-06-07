import {Entity, Column, ManyToOne, JoinColumn, OneToMany} from "typeorm";
import { BaseEntity } from "@/common/entity/base.entity";
import { User } from "@/users/entities/user.entity";
import { SimilarGroup } from "@/similar-groups/entities/similar-groups.entity";
import { ReservationResultEntity } from "@/reservations/entities/reservation-result.entity";
import { UserReservation } from "@/reservations/entities/user-reservation.entity";

export enum ReservationCategory {
    FOOD = "맛집",
    ACTIVITY = "액티비티",
    PERFORMANCE = "공연",
    SPORTS = "운동경기",
    ETC = "기타",
}

@Entity({ name: "reservations" })
export class Reservation extends BaseEntity {
    @Column()
    title: string;

    @Column({ type: "enum", enum: ReservationCategory })
    category: ReservationCategory;

    @Column()
    reservationDatetime: Date;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    linkUrl: string;

    @ManyToOne(() => User, user => user.hostedReservations)
    @JoinColumn({ name: "host_id" })
    host: User;

    @ManyToOne(() => SimilarGroup, group => group.reservations, {
        nullable: true
    })
    @JoinColumn({ name: "similar_group_id" })
    similarGroup: SimilarGroup;

    @OneToMany(() => ReservationResultEntity, reservationResult => reservationResult.reservation)
    results: ReservationResultEntity[];

    @OneToMany(() => UserReservation, userReservation => userReservation.reservation)
    userReservations: UserReservation[];
}
