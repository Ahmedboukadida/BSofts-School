import { Module } from '@nestjs/common';
import { BulletinsService } from './bulletins.service';
import { BulletinsController } from './bulletins.controller';

@Module({
  controllers: [BulletinsController],
  providers: [BulletinsService],
  exports: [BulletinsService],
})
export class BulletinsModule {}
