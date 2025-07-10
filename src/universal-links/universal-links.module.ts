import { Module } from '@nestjs/common';
import { UniversalLinksController } from './universal-links.controller';

@Module({
  controllers: [UniversalLinksController],
})
export class UniversalLinksModule {}
