import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LandingService } from './landing.service';

@ApiTags('Landing')
@Controller('landing')
export class LandingController {
  constructor(private readonly service: LandingService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Get available plans' })
  @ApiResponse({ status: 200, description: 'Plans retrieved successfully' })
  getPlans() {
    return this.service.getPlans();
  }

  @Get('modules')
  @ApiOperation({ summary: 'Get available modules' })
  @ApiResponse({ status: 200, description: 'Modules retrieved successfully' })
  getModules() {
    return this.service.getModules();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get platform stats' })
  @ApiResponse({ status: 200, description: 'Stats retrieved successfully' })
  getStats() {
    return this.service.getStats();
  }

  @Get('features')
  @ApiOperation({ summary: 'Get platform features' })
  @ApiResponse({ status: 200, description: 'Features retrieved successfully' })
  getFeatures() {
    return this.service.getFeatures();
  }
}
