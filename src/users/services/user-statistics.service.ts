import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In } from 'typeorm';
import { UserReservation } from '@/reservations/entities/user-reservation.entity';
import { ReservationResult } from '@/reservations/entities/reservation-result.entity';
import { UserStatisticsDto } from '../dto/response/get-my-info.response.dto';
import { ReservationResultStatus } from '@/common/enums/reservation-result-status';

@Injectable()
export class UserStatisticsService {
  constructor(
    @InjectRepository(UserReservation)
    private readonly userReservationRepository: Repository<UserReservation>,
    @InjectRepository(ReservationResult)
    private readonly reservationResultRepository: Repository<ReservationResult>,
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
          status: In([
            ReservationResultStatus.SUCCESS,
            ReservationResultStatus.HALF_SUCCESS,
          ]),
          deletedAt: IsNull(),
        },
      });

      return new UserStatisticsDto(totalReservations, successReservations);
    } catch {
      return new UserStatisticsDto(0, 0);
    }
  }
}
