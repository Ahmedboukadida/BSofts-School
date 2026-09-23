import {
  Controller, Post, Get, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { GenerateReportDto } from './report.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('stats')
  @Permissions('reports:list')
  @ApiOperation({ summary: 'Get aggregated dashboard and reporting statistics' })
  @ApiResponse({ status: 200, description: 'Stats retrieved successfully' })
  getStats(@Query('establishmentId') establishmentId?: string, @CurrentUser() user?: any) {
    const targetEstId = (establishmentId && establishmentId !== 'ALL' && establishmentId !== 'all')
      ? establishmentId
      : (!user?.isRoot ? user?.establishmentId : undefined);
    return this.service.getDashboardStats(targetEstId);
  }

  @Post('generate')
  @Permissions('reports:create')
  @ApiOperation({ summary: 'Generate a report' })
  @ApiResponse({ status: 201, description: 'Report generated successfully' })
  generate(@Body() dto: GenerateReportDto) {
    return this.service.generate(dto);
  }
}
