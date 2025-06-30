import { UsersModule } from '@/users/users.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { typeormConfig } from './common/database/config';
import { GlobalAuthGuard } from './common/guard/global-auth.guard';
import { ImagesModule } from './images/images.module';
import { NotificationLogsModule } from './notification-logs/notification-logs.module';
import { SimilarGroupsModule } from './similar-groups/similar-groups.module';
import { FilesModule } from './files/files.module';
import { ReservationsModule } from './reservations/reservations.module';
import { FirebaseModule } from './firebase/firebase.module';
import { CodesModule } from './codes/codes.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      ...typeormConfig,
      autoLoadEntities: true,
    }),
    UsersModule,
    ReservationsModule,
    AuthModule,
    SimilarGroupsModule,
    ImagesModule,
    NotificationLogsModule,
    FilesModule,
    ReservationsModule,
    FirebaseModule,
    CodesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: GlobalAuthGuard,
    },
  ],
})
export class AppModule {}
