import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Reservation } from './entities/reservation.entity';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UserReservation } from './entities/user-reservation.entity';
import { Image } from '@/images/entities/images.entity';
import { ImageParentType } from '@/common/enums/image-parent-type';

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
}
