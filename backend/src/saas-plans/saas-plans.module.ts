import { Module } from '@nestjs/common';
import { SaaSPlansService } from './saas-plans.service';
import { SaaSPlansController } from './saas-plans.controller';

@Module({
  controllers: [SaaSPlansController],
  providers: [SaaSPlansService],
  exports: [SaaSPlansService],
})
export class SaaSPlansModule {}
