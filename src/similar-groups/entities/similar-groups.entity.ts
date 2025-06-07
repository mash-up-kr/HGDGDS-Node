import { Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '@/common/entity/base.entity';
import { Reservation } from '@/reservations/entities/reservation.entity';

@Entity('similar_groups')
export class SimilarGroup extends BaseEntity {
    /**
     * @Todo
     * 해당 테이블 설계는 추후 진행 하는 걸로
     */

    @OneToMany(() => Reservation, (reservation) => reservation.similarGroup)
    reservations: Reservation[];
}
