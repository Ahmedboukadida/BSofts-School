import {
  Controller, Get, Post, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FinancialTransactionsService } from './financial-transactions.service';
import { CreateTransactionDto, QueryTransactionDto } from './financial-transaction.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators';

@ApiTags('Finance')
@ApiBearerAuth()
@Controller('financial-transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FinancialTransactionsController {
  constructor(private readonly service: FinancialTransactionsService) {}

  @Get()
  @Permissions('finance:list')
  @ApiOperation({ summary: 'List all financial transactions' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  findAll(@Query() query: QueryTransactionDto) {
    return this.service.findAll(query);
  }

  @Get('summary/:caisseId')
  @Permissions('finance:read')
  @ApiOperation({ summary: 'Get transaction summary for a caisse' })
  @ApiResponse({ status: 200, description: 'Transaction summary retrieved successfully' })
  getSummary(
    @Param('caisseId', ParseUUIDPipe) caisseId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.service.getSummary(caisseId, startDate, endDate);
  }

  @Post('transfer')
  @Permissions('finance:create')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT')
  @ApiOperation({ summary: 'Transfer funds between caisses with atomic balance updates' })
  @ApiResponse({ status: 201, description: 'Transfer executed successfully' })
  transfer(
    @Body() dto: { fromCaisseId: string; toCaisseId: string; amount: number; description?: string },
    @CurrentUser() user: any,
  ) {
    return this.service.transferBetweenCaisses(dto, user);
  }

  @Get(':id')
  @Permissions('finance:read')
  @ApiOperation({ summary: 'Get a financial transaction by ID' })
  @ApiResponse({ status: 200, description: 'Transaction retrieved successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Permissions('finance:create')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT')
  @ApiOperation({ summary: 'Create a new financial transaction' })
  @ApiResponse({ status: 201, description: 'Transaction created successfully' })
  create(@Body() dto: CreateTransactionDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }
}
