import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { HomeworkService } from './homework.service';
import { CreateHomeworkDto, UpdateHomeworkDto, QueryHomeworkDto } from './homework.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Homework')
@ApiBearerAuth()
@Controller('homework')
@UseGuards(JwtAuthGuard, RolesGuard)
export class HomeworkController {
  constructor(private readonly service: HomeworkService) {}

  @Get()
  @Permissions('homework:list')
  @ApiOperation({ summary: 'List all homework assignments' })
  @ApiResponse({ status: 200, description: 'Homework retrieved successfully' })
  findAll(@Query() query: QueryHomeworkDto, @CurrentUser() user: any) {
    return this.service.findAll(query, user);
  }

  @Get(':id')
  @Permissions('homework:read')
  @ApiOperation({ summary: 'Get a homework assignment by ID' })
  @ApiResponse({ status: 200, description: 'Homework retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Permissions('homework:create')
  @ApiOperation({ summary: 'Create a new homework assignment' })
  @ApiResponse({ status: 201, description: 'Homework created successfully' })
  create(@Body() dto: CreateHomeworkDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Put(':id')
  @Permissions('homework:update')
  @ApiOperation({ summary: 'Update a homework assignment' })
  @ApiResponse({ status: 200, description: 'Homework updated successfully' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateHomeworkDto,
    @CurrentUser() user: any,
  ) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @Permissions('homework:delete')
  @ApiOperation({ summary: 'Delete or soft-delete a homework assignment' })
  @ApiResponse({ status: 200, description: 'Homework deleted successfully' })
  remove(
    @Param('id') id: string,
    @Query('permanent') permanent: string,
    @CurrentUser() user: any,
  ) {
    const isPermanent = permanent === 'true';
    return this.service.remove(id, isPermanent, user);
  }

  @Patch(':id/restore')
  @Permissions('homework:update')
  @ApiOperation({ summary: 'Restore a homework assignment from trash' })
  @ApiResponse({ status: 200, description: 'Homework restored successfully' })
  restore(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.restore(id, user);
  }
}
