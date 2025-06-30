import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SimilarGroup } from './entities/similar-groups.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SimilarGroup])],
  exports: [TypeOrmModule],
})
export class SimilarGroupsModule {}
