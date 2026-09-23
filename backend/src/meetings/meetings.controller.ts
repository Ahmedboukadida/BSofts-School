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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MeetingsService } from './meetings.service';
import {
  CreateMeetingDto,
  UpdateMeetingDto,
  QueryMeetingDto,
  JoinMeetingDto,
  VoteMeetingPointDto,
  HandRaiseDto,
} from './meeting.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Meetings & Live Video')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('meetings')
export class MeetingsController {
  constructor(private readonly service: MeetingsService) {}

  @Get()
  @ApiOperation({ summary: 'List meetings with pagination and filters' })
  @ApiResponse({ status: 200, description: 'Meetings retrieved successfully' })
  findAll(@Query() query: QueryMeetingDto, @CurrentUser() user?: any) {
    return this.service.findAll(query, user);
  }

  @Post()
  @ApiOperation({ summary: 'Schedule a new meeting' })
  @ApiResponse({ status: 201, description: 'Meeting created successfully' })
  create(@Body() dto: CreateMeetingDto, @CurrentUser() user?: any) {
    return this.service.create(dto, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get meeting details with agenda points, participants, and documents' })
  @ApiResponse({ status: 200, description: 'Meeting details retrieved successfully' })
  findOne(@Param('id') id: string, @CurrentUser() user?: any) {
    return this.service.findOne(id, user);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update meeting details or status' })
  @ApiResponse({ status: 200, description: 'Meeting updated successfully' })
  update(@Param('id') id: string, @Body() dto: UpdateMeetingDto, @CurrentUser() user?: any) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive/delete meeting' })
  @ApiResponse({ status: 200, description: 'Meeting deleted successfully' })
  remove(@Param('id') id: string, @CurrentUser() user?: any) {
    return this.service.remove(id, user);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join a meeting and generate LiveKit WebRTC access token' })
  @ApiResponse({ status: 200, description: 'LiveKit room token generated successfully' })
  join(@Param('id') id: string, @Body() dto: JoinMeetingDto, @CurrentUser() user?: any) {
    return this.service.joinMeeting(id, dto, user);
  }

  @Post(':id/points/:pointId/vote')
  @ApiOperation({ summary: 'Cast a vote on an agenda point' })
  @ApiResponse({ status: 200, description: 'Vote registered successfully' })
  vote(
    @Param('id') id: string,
    @Param('pointId') pointId: string,
    @Body() dto: VoteMeetingPointDto,
  ) {
    return this.service.castVote(id, pointId, dto);
  }

  @Post(':id/hand-raise')
  @ApiOperation({ summary: 'Toggle participant hand raise status' })
  @ApiResponse({ status: 200, description: 'Hand raise status updated' })
  handRaise(@Param('id') id: string, @Body() dto: HandRaiseDto) {
    return this.service.toggleHandRaise(id, dto);
  }
}
