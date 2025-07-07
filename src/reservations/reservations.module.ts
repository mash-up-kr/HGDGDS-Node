import { Module } from '@nestjs/common';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { Reservation } from './entities/reservation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from '@/images/entities/images.entity';
import { UserReservation } from './entities/user-reservation.entity';
import { FilesService } from '@/files/files.service';
import { ReservationResultsService } from './reservation-results.service';
import { ReservationResult } from './entities/reservation-result.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Reservation,
      Image,
      UserReservation,
      ReservationResult,
    ]),
  ],
  controllers: [ReservationsController],
  providers: [ReservationsService, FilesService, ReservationResultsService],
})
export class ReservationsModule {}
