import { Module } from '@nestjs/common';
import { TeacherPaymentsService } from './teacher-payments.service';
import { TeacherPaymentsController } from './teacher-payments.controller';

@Module({
  controllers: [TeacherPaymentsController],
  providers: [TeacherPaymentsService],
  exports: [TeacherPaymentsService],
})
export class TeacherPaymentsModule {}
