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
import { User } from '@/users/entities/user.entity';
import { FirebaseService } from '@/firebase/firebase.service';
import { ReservationNotificationService } from './reservation-notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Reservation,
      Image,
      UserReservation,
      ReservationResult,
      User,
    ]),
  ],
  controllers: [ReservationsController],
  providers: [
    ReservationsService,
    FilesService,
    ReservationResultsService,
    FirebaseService,
    ReservationNotificationService,
  ],
})
export class ReservationsModule {}
