import { Module } from '@nestjs/common';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { Reservation } from './entities/reservation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from '@/images/entities/images.entity';
import { UserReservation } from './entities/user-reservation.entity';
import { FilesService } from '@/files/files.service';

@Module({
  imports: [TypeOrmModule.forFeature([Reservation, Image, UserReservation])],
  controllers: [ReservationsController],
  providers: [ReservationsService, FilesService],
})
export class ReservationsModule {}
