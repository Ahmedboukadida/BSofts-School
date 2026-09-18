import { Module } from '@nestjs/common';
import { ClassLevelsService } from './class-levels.service';
import { ClassLevelsController } from './class-levels.controller';

@Module({
  controllers: [ClassLevelsController],
  providers: [ClassLevelsService],
  exports: [ClassLevelsService],
})
export class ClassLevelsModule {}
