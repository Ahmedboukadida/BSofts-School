import {
  Controller, Get, Post, Body, Param, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PlatformSettingsService } from './platform-settings.service';
import { UpsertPlatformSettingDto } from './platform-setting.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Platform Settings')
@Controller('saas-settings')
export class PlatformSettingsController {
  constructor(private readonly service: PlatformSettingsService) {}

  @Get('public')
  @Public()
  @ApiOperation({ summary: 'Get public platform settings for login and branding' })
  @ApiResponse({ status: 200, description: 'Public settings map' })
  getPublicSettings() {
    return this.service.getAllAsMap(false);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ROOT', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get all platform settings map for admin dashboard' })
  @ApiResponse({ status: 200, description: 'Full settings map' })
  getAllSettings() {
    return this.service.getAllAsMap(true);
  }

  @Get('list')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ROOT', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'List all platform setting entities' })
  @ApiResponse({ status: 200, description: 'Platform setting entities list' })
  list() {
    return this.service.findAll();
  }

  @Get(':key')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ROOT', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Get single platform setting by key' })
  @ApiResponse({ status: 200, description: 'Platform setting entity' })
  findByKey(@Param('key') key: string) {
    return this.service.findByKey(key);
  }

  @Post('upsert')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ROOT')
  @ApiOperation({ summary: 'Upsert single platform setting' })
  @ApiResponse({ status: 201, description: 'Setting upserted' })
  upsert(@Body() dto: UpsertPlatformSettingDto, @CurrentUser() user: any) {
    return this.service.upsert(dto, user);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ROOT', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Save bulk platform settings' })
  @ApiResponse({ status: 200, description: 'Settings saved successfully' })
  saveBulk(@Body() body: Record<string, any>, @CurrentUser() user: any) {
    return this.service.saveBulk(body, user);
  }
}
