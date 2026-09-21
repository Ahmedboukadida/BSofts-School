import {
  Controller, Get, Delete, Query, UseGuards, Param, ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SystemLogsService } from './system-logs.service';
import { QuerySystemLogDto } from './system-log.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('system-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SystemLogsController {
  constructor(private readonly service: SystemLogsService) {}

  @Get()
  @Roles('ROOT', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'List all system error logs' })
  @ApiResponse({ status: 200, description: 'System logs retrieved successfully' })
  findAll(@Query() query: QuerySystemLogDto) {
    return this.service.findAll(query);
  }

  @Delete('purge/:days')
  @Roles('ROOT')
  @ApiOperation({ summary: 'Purge old system logs' })
  @ApiResponse({ status: 200, description: 'System logs purged successfully' })
  clearOldLogs(@Param('days', ParseIntPipe) days: number) {
    return this.service.clearOldLogs(days);
  }

  @Delete(':id')
  @Roles('ROOT')
  @ApiOperation({ summary: 'Delete a single system error log' })
  @ApiResponse({ status: 200, description: 'System log deleted successfully' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
