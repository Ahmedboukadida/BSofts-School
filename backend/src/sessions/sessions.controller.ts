import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SessionsService } from './sessions.service';
import { CreateSessionDto, UpdateSessionDto, QuerySessionDto } from './session.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';

@ApiTags('Scheduling')
@ApiBearerAuth()
@Controller('sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SessionsController {
  constructor(private readonly service: SessionsService) {}

  @Get()
  @Permissions('calendar:list')
  @ApiOperation({ summary: 'List all sessions' })
  @ApiResponse({ status: 200, description: 'Sessions retrieved successfully' })
  findAll(@Query() query: QuerySessionDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Permissions('calendar:read')
  @ApiOperation({ summary: 'Get a session by ID' })
  @ApiResponse({ status: 200, description: 'Session retrieved successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Permissions('calendar:create')
  @ApiOperation({ summary: 'Create a new session' })
  @ApiResponse({ status: 201, description: 'Session created successfully' })
  create(@Body() dto: CreateSessionDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @Permissions('calendar:update')
  @ApiOperation({ summary: 'Update a session' })
  @ApiResponse({ status: 200, description: 'Session updated successfully' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSessionDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Permissions('calendar:delete')
  @ApiOperation({ summary: 'Delete a session' })
  @ApiResponse({ status: 200, description: 'Session deleted successfully' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
