import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ExamsService } from './exams.service';
import { CreateExamDto, UpdateExamDto, QueryExamDto } from './exam.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Permissions } from '../common/decorators/permissions.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators';

@ApiTags('Exams')
@ApiBearerAuth()
@Controller('exams')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExamsController {
  constructor(private readonly service: ExamsService) {}

  @Get()
  @Permissions('exams:list')
  @ApiOperation({ summary: 'List all exams' })
  @ApiResponse({ status: 200, description: 'Exams retrieved successfully' })
  findAll(@Query() query: QueryExamDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @Permissions('exams:read')
  @ApiOperation({ summary: 'Get an exam by ID' })
  @ApiResponse({ status: 200, description: 'Exam retrieved successfully' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @Permissions('exams:create')
  @ApiOperation({ summary: 'Create a new exam' })
  @ApiResponse({ status: 201, description: 'Exam created successfully' })
  create(@Body() dto: CreateExamDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Put(':id')
  @Permissions('exams:update')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Update an exam' })
  @ApiResponse({ status: 200, description: 'Exam updated successfully' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExamDto,
    @CurrentUser() user: any,
  ) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @Permissions('exams:delete')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN')
  @ApiOperation({ summary: 'Delete an exam' })
  @ApiResponse({ status: 200, description: 'Exam deleted successfully' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('permanent') permanent?: string,
    @CurrentUser() user?: any,
  ) {
    const isPermanent = permanent === 'true';
    return this.service.remove(id, isPermanent, user);
  }

  // --- ONLINE EXAM ENGINE & QUESTION BANCO ---

  @Post(':id/questions')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Add a question to an exam (MCQ, True/False, Short Answer)' })
  @ApiResponse({ status: 201, description: 'Question added successfully' })
  addQuestion(
    @Param('id', ParseUUIDPipe) examId: string,
    @Body() dto: any,
    @CurrentUser() user: any,
  ) {
    return this.service.addQuestion(examId, dto, user);
  }

  @Put(':id/questions/:questionId')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Update an exam question' })
  @ApiResponse({ status: 200, description: 'Question updated successfully' })
  updateQuestion(
    @Param('id', ParseUUIDPipe) examId: string,
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @Body() dto: any,
    @CurrentUser() user: any,
  ) {
    return this.service.updateQuestion(examId, questionId, dto, user);
  }

  @Delete(':id/questions/:questionId')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'Delete an exam question' })
  @ApiResponse({ status: 200, description: 'Question deleted successfully' })
  deleteQuestion(
    @Param('id', ParseUUIDPipe) examId: string,
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @CurrentUser() user: any,
  ) {
    return this.service.deleteQuestion(examId, questionId, user);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start taking an online exam (Student)' })
  @ApiResponse({ status: 200, description: 'Exam session started or resumed' })
  startExam(
    @Param('id', ParseUUIDPipe) examId: string,
    @CurrentUser() user: any,
  ) {
    return this.service.startExam(examId, user);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: 'Submit exam answers with automated grading (Student)' })
  @ApiResponse({ status: 200, description: 'Exam submitted and graded' })
  submitExam(
    @Param('id', ParseUUIDPipe) examId: string,
    @Body() dto: any,
    @CurrentUser() user: any,
  ) {
    return this.service.submitExam(examId, user, dto);
  }

  @Get(':id/submissions')
  @Roles('ROOT', 'SUPER_ADMIN', 'ADMIN', 'TEACHER')
  @ApiOperation({ summary: 'List all student submissions for an exam' })
  @ApiResponse({ status: 200, description: 'Submissions retrieved successfully' })
  getSubmissions(
    @Param('id', ParseUUIDPipe) examId: string,
    @CurrentUser() user: any,
  ) {
    return this.service.getSubmissions(examId, user);
  }

  @Get(':id/my-submission')
  @ApiOperation({ summary: 'Get current student submission and score' })
  @ApiResponse({ status: 200, description: 'Student submission retrieved' })
  getMySubmission(
    @Param('id', ParseUUIDPipe) examId: string,
    @CurrentUser() user: any,
  ) {
    return this.service.getMySubmission(examId, user);
  }
}
