import {
  Controller, Get, Post, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { SendMessageDto, QueryMessageDto } from './message.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Messaging')
@ApiBearerAuth()
@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly service: MessagesService) {}

  @Get()
  @ApiOperation({ summary: 'List all messages' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  findAll(@Query() query: QueryMessageDto) {
    return this.service.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: 'Send a new message' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  send(@CurrentUser() user: any, @Body() dto: SendMessageDto) {
    return this.service.send(dto, user.id);
  }

  @Post(':conversationId/read')
  @ApiOperation({ summary: 'Mark conversation messages as read' })
  @ApiResponse({ status: 200, description: 'Messages marked as read' })
  markAsRead(@Param('conversationId', ParseUUIDPipe) conversationId: string, @CurrentUser() user: any) {
    return this.service.markAsRead(conversationId, user.id);
  }

  @Get('unread')
  @ApiOperation({ summary: 'Get unread messages count' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  getUnreadCount(@CurrentUser() user: any) {
    return this.service.getUnreadCount(user.id);
  }
}
