import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationLog } from './entities/notification-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationLog])],
  exports: [TypeOrmModule],
})
export class NotificationLogsModule {}
