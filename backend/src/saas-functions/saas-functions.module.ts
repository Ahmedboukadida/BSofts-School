import { Module } from '@nestjs/common';
import { SaaSFunctionsController } from './saas-functions.controller';
import { SaaSFunctionsService } from './saas-functions.service';

@Module({
  controllers: [SaaSFunctionsController],
  providers: [SaaSFunctionsService],
  exports: [SaaSFunctionsService],
})
export class SaaSFunctionsModule {}
