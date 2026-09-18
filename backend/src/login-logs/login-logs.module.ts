import { Module } from '@nestjs/common';
import { LoginLogsService } from './login-logs.service';
import { LoginLogsController } from './login-logs.controller';

@Module({
  controllers: [LoginLogsController],
  providers: [LoginLogsService],
  exports: [LoginLogsService],
})
export class LoginLogsModule {}
