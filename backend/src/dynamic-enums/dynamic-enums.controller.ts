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
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DynamicEnumsService } from './dynamic-enums.service';
import { CreateDynamicEnumDto, UpdateDynamicEnumDto, QueryDynamicEnumDto } from './dynamic-enum.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Dynamic Enums')
@ApiBearerAuth('access-token')
@Controller('dynamic-enums')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DynamicEnumsController {
  constructor(private readonly service: DynamicEnumsService) {}

  @Get()
  @ApiOperation({ summary: 'List dynamic enums by category or establishment' })
  async findAll(@Query() query: QueryDynamicEnumDto, @Req() req: any) {
    const establishmentId = req.headers['x-establishment-id'] || req.user?.establishmentId;
    return this.service.findAll(query, establishmentId);
  }

  @Get('category/:category')
  @ApiOperation({ summary: 'Get active enums for a specific category (e.g. PAYMENT_METHOD)' })
  async findByCategory(@Param('category') category: string, @Req() req: any) {
    const establishmentId = req.headers['x-establishment-id'] || req.user?.establishmentId;
    return this.service.findByCategory(category, establishmentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dynamic enum details by ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new dynamic enum definition' })
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  async create(@Body() dto: CreateDynamicEnumDto, @Req() req: any) {
    const establishmentId = req.headers['x-establishment-id'] || req.user?.establishmentId;
    return this.service.create(dto, establishmentId, req.user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update dynamic enum definition' })
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateDynamicEnumDto,
    @Req() req: any,
  ) {
    return this.service.update(id, dto, req.user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate dynamic enum' })
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  async remove(@Param('id') id: string, @Req() req: any) {
    return this.service.remove(id, req.user);
  }
}
