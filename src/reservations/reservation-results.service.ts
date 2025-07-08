import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { UserReservation } from './entities/user-reservation.entity';
import { Image } from '@/images/entities/images.entity';
import { ImageParentType } from '@/common/enums/image-parent-type';
import { UserReservationStatus } from '@/common/enums/user-reservation-status';
import { FilesService } from '@/files/files.service';
import { ReservationResult } from './entities/reservation-result.entity';
import { CreateReservationResultRequest } from './dto/request/create-reservation-result.request';
import { ReservationResultStatus } from '@/common/enums/reservation-result-status';
import { Reservation } from './entities/reservation.entity';
import { User } from '@/users/entities/user.entity';
import {
  ReservationNotFoundException,
  ReservationResultAlreadyExistsException,
  UserReservationNotFoundException,
} from '@/common/exception/reservation.exception';

@Injectable()
export class ReservationResultsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    @InjectRepository(UserReservation)
    private readonly userReservationRepository: Repository<UserReservation>,
    private readonly dataSource: DataSource,
    private readonly filesService: FilesService,
  ) {}

  async createReservationResult(
    reservationId: number,
    user: User,
    reservationData: CreateReservationResultRequest,
  ): Promise<ReservationResult> {
    let userReservationStatus: UserReservationStatus;
    if (reservationData.status === ReservationResultStatus.FAIL) {
      userReservationStatus = UserReservationStatus.FAIL;
    } else {
      userReservationStatus = UserReservationStatus.SUCCESS;
    }

    const reservation = await this.reservationRepository.findOne({
      where: { id: reservationId },
    });
    if (!reservation) {
      throw new ReservationNotFoundException();
    }

    const userReservation = await this.userReservationRepository.findOne({
      where: {
        reservation: { id: reservationId },
        user: { id: user.id },
      },
    });
    if (!userReservation) {
      throw new UserReservationNotFoundException();
    }

    let result: ReservationResult;
    try {
      result = await this.dataSource.transaction(async (manager) => {
        const reservationResultRepo = manager.getRepository(ReservationResult);
        const imageRepo = manager.getRepository(Image);
        const userReservationRepo = manager.getRepository(UserReservation);

        // 1. Reservation 저장
        const reservationResult: ReservationResult =
          reservationResultRepo.create(reservationData);
        reservationResult.user = user;
        reservationResult.reservation = reservation;
        const savedReservationResult: ReservationResult =
          await reservationResultRepo.save(reservationResult);

        // 2. Image 저장
        const images =
          reservationData.images?.map((path) => {
            const image = new Image();
            image.s3FilePath = path;
            image.parentType = ImageParentType.RESERVATION_RESULT;
            image.parentId = savedReservationResult.id;
            return imageRepo.create(image);
          }) || [];
        await manager.getRepository(Image).save(images);

        // 3. UserReservation 수정
        await userReservationRepo.update(
          {
            user: reservationResult.user,
            reservation: reservationResult.reservation,
          },
          {
            status: userReservationStatus,
          },
        );

        return savedReservationResult;
      });
    } catch (error) {
      const UNIQUE_VIOLATION = '23505';

      if (
        error instanceof QueryFailedError &&
        'code' in error &&
        (error as QueryFailedError & { code: string }).code === UNIQUE_VIOLATION
      ) {
        throw new ReservationResultAlreadyExistsException();
      }
      throw error;
    }

    return result;
  }
}
