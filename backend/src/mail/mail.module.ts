import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { MailService } from './mail.service';
import { MailController } from './mail.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, PassportModule.register({ defaultStrategy: 'jwt' })],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
