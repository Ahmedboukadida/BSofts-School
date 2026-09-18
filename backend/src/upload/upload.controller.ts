import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { UploadService, UploadFileInput } from './upload.service';
import { UploadEntity } from './upload.entity';
import { UploadQueryDto } from './upload.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('Uploads')
@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('file')
  @ApiOperation({ summary: 'Upload a single file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingle(
    @UploadedFile() file: UploadFileInput,
    @Query() query: UploadQueryDto,
    @Req() req: any,
  ): Promise<UploadEntity> {
    return this.uploadService.saveFile(file, query.folder, req.user);
  }

  @Post('multiple')
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: { type: 'array', items: { type: 'string', format: 'binary' } },
      },
    },
  })
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadMultiple(
    @UploadedFiles() files: UploadFileInput[],
    @Query() query: UploadQueryDto,
    @Req() req: any,
  ): Promise<UploadEntity[]> {
    const results: UploadEntity[] = [];
    for (const f of files) {
      const res = await this.uploadService.saveFile(f, query.folder, req.user);
      results.push(res);
    }
    return results;
  }
}
