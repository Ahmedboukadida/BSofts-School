import { Controller, Get, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LoginLogsService } from './login-logs.service';
import { QueryLoginLogDto } from './login-log.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('Settings')
@ApiBearerAuth()
@Controller('login-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LoginLogsController {
  constructor(private readonly loginLogsService: LoginLogsService) {}

  @Get()
  @Permissions('users:view_logs')
  @ApiOperation({ summary: 'List all login logs' })
  @ApiResponse({ status: 200, description: 'Login logs retrieved successfully' })
  findAll(@Query() query: QueryLoginLogDto) {
    return this.loginLogsService.findAll(query);
  }

  @Get('user/:userId')
  @Permissions('users:view_logs')
  @ApiOperation({ summary: 'Get login logs for a user' })
  @ApiResponse({ status: 200, description: 'User login logs retrieved successfully' })
  findByUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.loginLogsService.findByUser(userId);
  }

  @Get('stats')
  @Permissions('users:view_logs')
  @ApiOperation({ summary: 'Get login statistics' })
  @ApiResponse({ status: 200, description: 'Login statistics retrieved successfully' })
  getStats(@Query('userId') userId?: string) {
    return this.loginLogsService.getStats(userId);
  }
}
