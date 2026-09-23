import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LivekitModule } from '../livekit/livekit.module';
import { MeetingsController } from './meetings.controller';
import { MeetingsService } from './meetings.service';

@Module({
  imports: [PrismaModule, LivekitModule],
  controllers: [MeetingsController],
  providers: [MeetingsService],
  exports: [MeetingsService],
})
export class MeetingsModule {}
