import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersRepository } from '@/users/users.repository';
import { JwtModule } from '@nestjs/jwt';
import { FilesModule } from '@/files/files.module';

@Module({
  imports: [JwtModule.register({}), FilesModule],
  controllers: [AuthController],
  providers: [AuthService, UsersRepository],
  exports: [AuthService],
})
export class AuthModule {}
