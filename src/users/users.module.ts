import { JwtStrategy } from '@/common/guard/strategy/jwt.strategy';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserReservation } from '@/reservations/entities/user-reservation.entity';
import { ReservationResultEntity } from '@/reservations/entities/reservation-result.entity';
import { FilesModule } from '@/files/files.module';
import { UsersController } from './users.controller';
import { UsersRepository } from './users.repository';
import { UsersService } from './services/users.service'; // 경로 수정
import { UserStatisticsService } from './services/user-statistics.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserReservation, ReservationResultEntity]),
    FilesModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    UserStatisticsService,
    JwtStrategy,
  ],
  exports: [UsersService],
})
export class UsersModule {}
