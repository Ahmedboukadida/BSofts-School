import { Module } from '@nestjs/common';
import { DynamicEnumsController } from './dynamic-enums.controller';
import { DynamicEnumsService } from './dynamic-enums.service';

@Module({
  controllers: [DynamicEnumsController],
  providers: [DynamicEnumsService],
  exports: [DynamicEnumsService],
})
export class DynamicEnumsModule {}
