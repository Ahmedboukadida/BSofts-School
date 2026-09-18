import { Module } from '@nestjs/common';
import { TeacherLeavesService } from './teacher-leaves.service';
import { TeacherLeavesController } from './teacher-leaves.controller';

@Module({
  controllers: [TeacherLeavesController],
  providers: [TeacherLeavesService],
  exports: [TeacherLeavesService],
})
export class TeacherLeavesModule {}
