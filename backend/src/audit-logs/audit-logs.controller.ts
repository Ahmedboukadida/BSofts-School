import {
  Controller, Get, Post, Body, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { CreateAuditLogDto, QueryAuditLogDto } from './audit-log.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('Settings')
@ApiBearerAuth()
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AuditLogsController {
  constructor(private readonly service: AuditLogsService) {}

  @Get()
  @Permissions('reports:view')
  @ApiOperation({ summary: 'List all audit logs' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved successfully' })
  findAll(@Query() query: QueryAuditLogDto) {
    return this.service.findAll(query);
  }

  @Post()
  @Permissions('reports:create')
  @ApiOperation({ summary: 'Create an audit log entry' })
  @ApiResponse({ status: 201, description: 'Audit log created successfully' })
  log(@Body() dto: CreateAuditLogDto) {
    return this.service.log(dto);
  }
}
