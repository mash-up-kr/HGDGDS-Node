import { Module } from '@nestjs/common';
import { CodesController } from './codes.controller';
import { FilesModule } from '@/files/files.module';

@Module({
  imports: [FilesModule],
  controllers: [CodesController],
})
export class CodesModule {}
