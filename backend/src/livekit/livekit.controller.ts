import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LivekitService } from './livekit.service';
import { LiveKitConfigDto, GenerateLiveKitTokenDto } from './livekit.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators';

@ApiTags('LiveKit Video & Realtime')
@Controller('livekit')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class LivekitController {
  constructor(private readonly livekitService: LivekitService) {}

  @Get('config')
  @ApiOperation({ summary: 'Get current LiveKit Cloud configuration' })
  @Roles('ROOT', 'SUPER_ADMIN')
  async getConfig(): Promise<LiveKitConfigDto> {
    return this.livekitService.getConfig();
  }

  @Post('config')
  @ApiOperation({ summary: 'Save dynamic LiveKit Cloud configuration' })
  @Roles('ROOT')
  async saveConfig(@Body() dto: LiveKitConfigDto, @Req() req: any): Promise<LiveKitConfigDto> {
    return this.livekitService.saveConfig(dto, req.user);
  }

  @Post('token')
  @ApiOperation({ summary: 'Generate user access token for a LiveKit room' })
  async generateToken(@Body() dto: GenerateLiveKitTokenDto): Promise<{ token: string; url: string }> {
    return this.livekitService.generateToken(dto);
  }

  @Post('test-connection')
  @ApiOperation({ summary: 'Test LiveKit credentials connection' })
  @Roles('ROOT', 'SUPER_ADMIN')
  async testConnection(): Promise<{ success: boolean; message: string }> {
    return this.livekitService.testConnection();
  }

  @Public()
  @Post('webhook')
  @ApiOperation({ summary: 'Receive and verify LiveKit server webhooks' })
  async handleWebhook(@Req() req: any, @Body() body: any): Promise<{ received: boolean }> {
    const authHeader = req.headers?.authorization || req.headers?.['x-livekit-signature'] || '';
    const rawBody = typeof req.rawBody === 'string'
      ? req.rawBody
      : JSON.stringify(body);
    await this.livekitService.verifyWebhookSignature(authHeader, rawBody);
    return { received: true };
  }
}
