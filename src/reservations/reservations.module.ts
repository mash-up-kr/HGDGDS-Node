import { Module } from '@nestjs/common';
import { ReservationsController } from './reservations.controller';

@Module({
  controllers: [ReservationsController],
})
export class ReservationsModule {}
