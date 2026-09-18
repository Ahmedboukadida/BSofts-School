import { Module } from '@nestjs/common';
import { AcademicModulesService } from './academic-modules.service';
import { AcademicModulesController } from './academic-modules.controller';

@Module({
  controllers: [AcademicModulesController],
  providers: [AcademicModulesService],
  exports: [AcademicModulesService],
})
export class AcademicModulesModule {}
