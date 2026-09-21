import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ParentsService } from './parents.service';
import { CreateParentDto, UpdateParentDto, QueryParentDto, JustifyAbsenceDto, ParentSendMessageDto } from './parent.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators';

@ApiTags('Parents')
@ApiBearerAuth()
@Controller('parents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ParentsController {
  constructor(private readonly service: ParentsService) {}

  @Get()
  @Permissions('parents:list')
  @ApiOperation({ summary: 'List all parents' })
  @ApiResponse({ status: 200, description: 'Parents retrieved successfully' })
  findAll(@Query() query: QueryParentDto) {
    return this.service.findAll(query);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get authenticated parent profile and children academic metrics' })
  @ApiResponse({ status: 200, description: 'Parent profile retrieved successfully' })
  findMe(@CurrentUser() user: any) {
    return this.service.findMe(user);
  }

  @Post('justify-absence')
  @ApiOperation({ summary: 'Submit justification for child absence' })
  @ApiResponse({ status: 200, description: 'Justification submitted successfully' })
  justifyAbsence(@Body() dto: JustifyAbsenceDto, @CurrentUser() user: any) {
    return this.service.justifyAbsence(dto, user);
  }

  @Post('message')
  @ApiOperation({ summary: 'Send message from parent to administration' })
  @ApiResponse({ status: 200, description: 'Message sent successfully' })
  sendMessage(@Body() dto: ParentSendMessageDto, @CurrentUser() user: any) {
    return this.service.sendMessage(dto, user);
  }

  @Get(':id')
  @Permissions('parents:read')
  @ApiOperation({ summary: 'Get a parent by ID' })
  @ApiResponse({ status: 200, description: 'Parent retrieved successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Permissions('parents:create')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Create a new parent' })
  @ApiResponse({ status: 201, description: 'Parent created successfully' })
  create(@Body() dto: CreateParentDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Put(':id')
  @Permissions('parents:update')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Update a parent' })
  @ApiResponse({ status: 200, description: 'Parent updated successfully' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateParentDto,
    @CurrentUser() user?: any,
  ) {
    return this.service.update(id, dto, user);
  }

  @Post(':id/restore')
  @Permissions('parents:update')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Restore a deactivated parent' })
  @ApiResponse({ status: 200, description: 'Parent restored successfully' })
  restore(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user?: any) {
    return this.service.restore(id, user);
  }

  @Delete(':id')
  @Permissions('parents:delete')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Delete a parent (soft delete or permanent delete for root)' })
  @ApiResponse({ status: 200, description: 'Parent deleted successfully' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('permanent') permanent?: string,
    @CurrentUser() user?: any,
  ) {
    const isPermanent = permanent === 'true';
    return this.service.remove(id, isPermanent, user);
  }
}
