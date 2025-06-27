import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UserReservation } from './entities/user-reservation.entity';
import { Image } from '@/images/entities/images.entity';
import { ImageParentType } from '@/common/enums/image-parent-type';
import {
  ReservationAlreadyJoinedException,
  ReservationFullException,
  ReservationNotFoundException,
} from '@/common/exception/reservation.exception';

@Injectable()
export class ReservationsService {
  constructor(
    @InjectRepository(Reservation)
    private readonly reservationRepository: Repository<Reservation>,
    private readonly dataSource: DataSource,
  ) {}

  async createReservation(
    reservationData: CreateReservationDto,
  ): Promise<Reservation> {
    return await this.dataSource.transaction(async (manager) => {
      const reservationRepo = manager.getRepository(Reservation);
      const imageRepo = manager.getRepository(Image);
      const userReservationRepo = manager.getRepository(UserReservation);

      // 1. Reservation 저장
      const reservation: Reservation = reservationRepo.create(reservationData);
      const savedReservation: Reservation =
        await reservationRepo.save(reservation);

      // 2. Image 저장
      const images =
        reservationData.images?.map((path) => {
          const image = new Image();
          image.s3FilePath = path;
          image.parentType = ImageParentType.RESERVATION;
          image.parentId = savedReservation.id;
          return imageRepo.create(image);
        }) || [];
      await manager.getRepository(Image).save(images);

      // 3. UserReservation 저장
      const userReservation = userReservationRepo.create({
        user: reservation.host,
        reservation: savedReservation,
      });
      await manager.getRepository(UserReservation).save(userReservation);

      return savedReservation;
    });
  }

  async joinReservation(
    reservationId: number,
    userId: number,
  ): Promise<UserReservation> {
    const maxParticipants = 30;

    return await this.dataSource.transaction(async (manager) => {
      const userReservationRepo = manager.getRepository(UserReservation);
      const reservationRepo = manager.getRepository(Reservation);

      // 1. Reservation 조회
      const reservation = await reservationRepo.findOne({
        where: { id: reservationId },
        relations: ['host'],
      });

      if (!reservation) {
        throw new ReservationNotFoundException();
      }

      // 2. 이미 가입된 예약인지 확인
      const existing = await userReservationRepo.findOne({
        where: {
          reservation: { id: reservationId },
          user: { id: userId },
        },
      });
      if (existing) {
        throw new ReservationAlreadyJoinedException();
      }

      // 3. 예약 멤버 수 확인
      const memberCount = await userReservationRepo.count({
        where: { reservation: { id: reservationId } },
      });
      if (memberCount >= maxParticipants) {
        throw new ReservationFullException();
      }

      // 4. UserReservation 생성
      const userReservation = userReservationRepo.create({
        user: { id: userId },
        reservation,
      });

      return await userReservationRepo.save(userReservation);
    });
  }
}
