import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SaaSFunctionsService } from './saas-functions.service';
import {
  CreateSaaSFunctionDto,
  UpdateSaaSFunctionDto,
  QuerySaaSFunctionDto,
} from './saas-functions.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('SaaS Functions')
@ApiBearerAuth()
@Controller('saas-functions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ROOT')
export class SaaSFunctionsController {
  constructor(private readonly saasFunctionsService: SaaSFunctionsService) {}

  @Get()
  @ApiOperation({ summary: 'List all SaaS functions (ROOT only)' })
  @ApiResponse({ status: 200, description: 'SaaS functions retrieved successfully' })
  findAll(@Query() query: QuerySaaSFunctionDto) {
    return this.saasFunctionsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a SaaS function by ID (ROOT only)' })
  @ApiResponse({ status: 200, description: 'SaaS function retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.saasFunctionsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new SaaS function (ROOT only)' })
  @ApiResponse({ status: 201, description: 'SaaS function created successfully' })
  create(@Body() dto: CreateSaaSFunctionDto) {
    return this.saasFunctionsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a SaaS function (ROOT only)' })
  @ApiResponse({ status: 200, description: 'SaaS function updated successfully' })
  update(@Param('id') id: string, @Body() dto: UpdateSaaSFunctionDto) {
    return this.saasFunctionsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete or soft-delete a SaaS function (ROOT only)' })
  @ApiResponse({ status: 200, description: 'SaaS function deleted successfully' })
  remove(@Param('id') id: string, @Query('permanent') permanent?: string) {
    const isPermanent = permanent === 'true' || permanent === '1';
    return this.saasFunctionsService.remove(id, isPermanent);
  }

  @Post(':id/restore')
  @ApiOperation({ summary: 'Restore an archived SaaS function (ROOT only)' })
  @ApiResponse({ status: 200, description: 'SaaS function restored successfully' })
  restore(@Param('id') id: string) {
    return this.saasFunctionsService.restore(id);
  }
}
