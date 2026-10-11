import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AiService } from './ai.service';
import {
  AiChatDto,
  AiGenerateExamDto,
  AiGenerateBulletinRemarksDto,
  AiGenerateHomeworkDto,
  AiToggleTenantDto,
  AiPlatformConfigDto,
} from './ai.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('AI Integration')
@ApiBearerAuth()
@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get AI feature enablement status for current user / tenant' })
  @ApiResponse({ status: 200, description: 'AI status returned successfully' })
  getStatus(@CurrentUser() user: any) {
    return this.aiService.getStatusForUser(user);
  }

  @Post('chat')
  @ApiOperation({ summary: 'Chat with tenant-isolated school AI assistant' })
  @ApiResponse({ status: 200, description: 'AI response received' })
  chat(@CurrentUser() user: any, @Body() dto: AiChatDto) {
    return this.aiService.chat(user, dto);
  }

  @Post('generate/exam')
  @ApiOperation({ summary: 'Generate structured exam questions with AI' })
  @ApiResponse({ status: 200, description: 'Exam generated successfully' })
  generateExam(@CurrentUser() user: any, @Body() dto: AiGenerateExamDto) {
    return this.aiService.generateExam(user, dto);
  }

  @Post('generate/bulletin-remarks')
  @ApiOperation({ summary: 'Generate pedagogical report card remarks with AI' })
  @ApiResponse({ status: 200, description: 'Remarks generated successfully' })
  generateBulletinRemarks(
    @CurrentUser() user: any,
    @Body() dto: AiGenerateBulletinRemarksDto,
  ) {
    return this.aiService.generateBulletinRemarks(user, dto);
  }

  @Post('generate/homework')
  @ApiOperation({ summary: 'Generate homework assignment & rubric with AI' })
  @ApiResponse({ status: 200, description: 'Homework generated successfully' })
  generateHomework(@CurrentUser() user: any, @Body() dto: AiGenerateHomeworkDto) {
    return this.aiService.generateHomework(user, dto);
  }

  // ==========================================
  // ROOT / DEVELOPER ONLY CONTROLS
  // ==========================================

  @Put('admin/tenants/:id/toggle')
  @UseGuards(RolesGuard)
  @Roles('ROOT')
  @ApiOperation({ summary: 'ROOT: Enable or disable AI feature for a tenant' })
  @ApiResponse({ status: 200, description: 'Tenant AI feature toggled' })
  toggleTenant(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AiToggleTenantDto,
    @CurrentUser() user: any,
  ) {
    return this.aiService.toggleTenantAi(id, dto.isEnabled, user);
  }

  @Get('admin/config')
  @UseGuards(RolesGuard)
  @Roles('ROOT')
  @ApiOperation({ summary: 'ROOT: Get platform AI configuration with masked keys' })
  @ApiResponse({ status: 200, description: 'Platform AI configuration returned' })
  getPlatformConfig() {
    return this.aiService.getAdminPlatformConfig();
  }

  @Put('admin/config')
  @UseGuards(RolesGuard)
  @Roles('ROOT')
  @ApiOperation({ summary: 'ROOT: Update platform AI provider, model, and API keys' })
  @ApiResponse({ status: 200, description: 'Platform AI configuration updated' })
  updatePlatformConfig(
    @Body() dto: AiPlatformConfigDto,
    @CurrentUser() user: any,
  ) {
    return this.aiService.updateAdminPlatformConfig(dto, user);
  }
}
