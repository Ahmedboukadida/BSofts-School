import {
  Controller, Get, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly service: ReportsService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get aggregated dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved successfully' })
  getStats(
    @Query('establishmentId') establishmentId?: string,
    @Query('tenantId') tenantId?: string,
    @Query('academicYearId') academicYearId?: string,
    @CurrentUser() user?: any,
  ) {
    const targetEstId = (establishmentId && establishmentId !== 'ALL' && establishmentId !== 'all')
      ? establishmentId
      : (!user?.isRoot ? user?.establishmentId : undefined);
    const targetTenantId = (tenantId && tenantId !== 'ALL' && tenantId !== 'all')
      ? tenantId
      : undefined;
    const targetYearId = (academicYearId && academicYearId !== 'ALL' && academicYearId !== 'all')
      ? academicYearId
      : undefined;
    return this.service.getDashboardStats(targetEstId, targetTenantId, targetYearId);
  }
}
