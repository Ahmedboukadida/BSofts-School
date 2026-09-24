import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotesService } from './notes.service';
import { CreateNoteDto, UpdateNoteDto, QueryNoteDto, BulkSaveNotesDto } from './note.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { CurrentUser } from '../common/decorators';

@ApiTags('Exams')
@ApiBearerAuth()
@Controller('notes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotesController {
  constructor(private readonly service: NotesService) {}

  @Get()
  @Permissions('grades:list')
  @ApiOperation({ summary: 'List all notes' })
  @ApiResponse({ status: 200, description: 'Notes retrieved successfully' })
  findAll(@Query() query: QueryNoteDto) {
    return this.service.findAll(query);
  }

  @Get('student/:studentId/period/:periodId')
  @Permissions('grades:read')
  @ApiOperation({ summary: 'Get notes for a student in a period' })
  @ApiResponse({ status: 200, description: 'Student period notes retrieved successfully' })
  getStudentPeriodNotes(
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Param('periodId', ParseUUIDPipe) periodId: string,
  ) {
    return this.service.getStudentPeriodNotes(studentId, periodId);
  }

  @Post('bulk')
  @Permissions('grades:create')
  @ApiOperation({ summary: 'Bulk save student grades' })
  @ApiResponse({ status: 201, description: 'Grades saved successfully' })
  bulkSave(@Body() dto: BulkSaveNotesDto, @CurrentUser() user: any) {
    return this.service.bulkSave(dto, user);
  }

  @Get('gradebook')
  @Permissions('grades:read')
  @ApiOperation({ summary: 'Get full gradebook with averages and ranks for a class and period' })
  @ApiResponse({ status: 200, description: 'Gradebook retrieved successfully' })
  getGradebook(
    @Query('classId', ParseUUIDPipe) classId: string,
    @Query('periodId', ParseUUIDPipe) periodId: string,
  ) {
    return this.service.getGradebook(classId, periodId);
  }

  @Get(':id')
  @Permissions('grades:read')
  @ApiOperation({ summary: 'Get a note by ID' })
  @ApiResponse({ status: 200, description: 'Note retrieved successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Permissions('grades:create')
  @ApiOperation({ summary: 'Create a new note' })
  @ApiResponse({ status: 201, description: 'Note created successfully' })
  create(@Body() dto: CreateNoteDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @Permissions('grades:update')
  @ApiOperation({ summary: 'Update a note' })
  @ApiResponse({ status: 200, description: 'Note updated successfully' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateNoteDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Permissions('grades:delete')
  @ApiOperation({ summary: 'Delete a note' })
  @ApiResponse({ status: 200, description: 'Note deleted successfully' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
