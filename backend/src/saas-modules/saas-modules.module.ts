import { Module } from '@nestjs/common';
import { SaaSModulesService } from './saas-modules.service';
import { SaaSModulesController } from './saas-modules.controller';

@Module({
  controllers: [SaaSModulesController],
  providers: [SaaSModulesService],
  exports: [SaaSModulesService],
})
export class SaaSModulesModule {}
