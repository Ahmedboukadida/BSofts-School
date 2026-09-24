import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BulletinsService } from './bulletins.service';
import { CreateBulletinDto, UpdateBulletinDto, QueryBulletinDto } from './bulletin.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators';

@ApiTags('Bulletins')
@ApiBearerAuth()
@Controller('bulletins')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BulletinsController {
  constructor(private readonly service: BulletinsService) {}

  @Get()
  @Permissions('bulletins:list')
  @ApiOperation({ summary: 'List all bulletins' })
  @ApiResponse({ status: 200, description: 'Bulletins retrieved successfully' })
  findAll(@Query() query: QueryBulletinDto) {
    return this.service.findAll(query);
  }

  @Post('generate')
  @Permissions('bulletins:create')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Calculate and generate bulletins for a class and period' })
  @ApiResponse({ status: 201, description: 'Class bulletins generated and ranked successfully' })
  generate(@Body() body: { classId: string; periodId: string }, @CurrentUser() user: any) {
    return this.service.generateForClass(body.classId, body.periodId, user);
  }

  @Post('generate-class')
  @Permissions('bulletins:create')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Calculate and generate bulletins for an entire class' })
  @ApiResponse({ status: 201, description: 'Class bulletins generated and ranked successfully' })
  generateForClass(@Body() body: { classId: string; periodId: string }, @CurrentUser() user: any) {
    return this.service.generateForClass(body.classId, body.periodId, user);
  }

  @Get(':id/detailed')
  @Permissions('bulletins:read')
  @ApiOperation({ summary: 'Get complete printable bulletin with subject breakdown and class rank' })
  @ApiResponse({ status: 200, description: 'Detailed bulletin retrieved successfully' })
  getDetailed(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getDetailedBulletin(id);
  }

  @Get(':id')
  @Permissions('bulletins:read')
  @ApiOperation({ summary: 'Get a bulletin by ID' })
  @ApiResponse({ status: 200, description: 'Bulletin retrieved successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Permissions('bulletins:create')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Create a new bulletin' })
  @ApiResponse({ status: 201, description: 'Bulletin created successfully' })
  create(@Body() dto: CreateBulletinDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Put(':id')
  @Permissions('bulletins:update')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Update a bulletin' })
  @ApiResponse({ status: 200, description: 'Bulletin updated successfully' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateBulletinDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Permissions('bulletins:delete')
  @Roles('ROOT', 'SUPER_ADMIN')
  @ApiOperation({ summary: 'Delete a bulletin' })
  @ApiResponse({ status: 200, description: 'Bulletin deleted successfully' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
