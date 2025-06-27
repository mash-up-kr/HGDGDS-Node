import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { UserReservation } from '@/reservations/entities/user-reservation.entity';
import { ReservationResultEntity } from '@/reservations/entities/reservation-result.entity';
import { UserStatisticsDto } from '../dto/response/get-my-info.response.dto';

@Injectable()
export class UserStatisticsService {
  constructor(
    @InjectRepository(UserReservation)
    private readonly userReservationRepository: Repository<UserReservation>,
    @InjectRepository(ReservationResultEntity)
    private readonly reservationResultRepository: Repository<ReservationResultEntity>,
  ) {}

  /**
   * 사용자 예약 통계 조회
   * TODO: 기간 언제까지 할건지 논의해보기
   */
  async getUserStatistics(userId: number): Promise<UserStatisticsDto> {
    try {
      const totalReservations = await this.userReservationRepository.count({
        where: {
          user: { id: userId },
          deletedAt: IsNull(),
        },
      });

      const successReservations = await this.reservationResultRepository.count({
        where: {
          user: { id: userId },
          isSuccess: true,
          deletedAt: IsNull(),
        },
      });

      return new UserStatisticsDto(totalReservations, successReservations);
    } catch {
      return new UserStatisticsDto(0, 0);
    }
  }
}
