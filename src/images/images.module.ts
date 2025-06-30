import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from './entities/images.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Image])],
  exports: [TypeOrmModule],
})
export class ImagesModule {}
