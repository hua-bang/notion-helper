import { Module } from '@nestjs/common';
import { CozeService } from './coze.service';
import { CozeController } from './coze.controller';

@Module({
  controllers: [CozeController],
  providers: [CozeService],
  exports: [CozeService],
})
export class CozeModule {}
