import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadEntity } from './upload.entity';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

export interface UploadFileInput {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
  filename?: string;
}

export const ALLOWED_UPLOAD_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'text/plain',
]);

export const MAX_UPLOAD_FILE_SIZE = 10 * 1024 * 1024; // 10MB

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly baseUploadDir = path.join(process.cwd(), 'uploads');

  constructor(private readonly prisma: PrismaService) {
    if (!fs.existsSync(this.baseUploadDir)) {
      fs.mkdirSync(this.baseUploadDir, { recursive: true });
    }
  }

  private sanitizeFolder(folder: string): string {
    if (!folder) return 'general';
    if (
      folder.includes('..') ||
      folder.includes(':') ||
      folder.startsWith('/') ||
      folder.startsWith('\\') ||
      path.isAbsolute(folder)
    ) {
      throw new BadRequestException('Invalid upload folder path traversal detected');
    }
    const normalized = path.normalize(folder).replace(/\0/g, '');
    const cleaned = normalized.replace(/^[/\\]+/, '');
    if (cleaned.includes('..') || path.isAbsolute(cleaned)) {
      throw new BadRequestException('Invalid upload folder path traversal detected');
    }
    return cleaned;
  }

  async saveFile(file: UploadFileInput, folder = 'general', user?: any): Promise<UploadEntity> {
    try {
      if (!file) {
        throw new BadRequestException('No file provided for upload');
      }

      if (file.size > MAX_UPLOAD_FILE_SIZE) {
        throw new BadRequestException('File size exceeds the 10MB limit');
      }

      if (!ALLOWED_UPLOAD_MIME_TYPES.has(file.mimetype)) {
        throw new BadRequestException(
          `Unsupported file type '${file.mimetype}'. Allowed: images, PDFs, Office docs, CSV, text.`,
        );
      }

      const safeFolder = this.sanitizeFolder(folder);
      const targetDir = path.resolve(this.baseUploadDir, safeFolder);
      if (!targetDir.startsWith(path.resolve(this.baseUploadDir))) {
        throw new BadRequestException('Path traversal forbidden');
      }

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueName = `${randomUUID()}${ext}`;
      const fullPath = path.join(targetDir, uniqueName);

      fs.writeFileSync(fullPath, file.buffer);

      const fileUrl = `/uploads/${safeFolder}/${uniqueName}`;
      const result = new UploadEntity({
        id: randomUUID(),
        originalName: file.originalname,
        fileName: uniqueName,
        mimeType: file.mimetype,
        size: file.size,
        url: fileUrl,
        createdAt: new Date(),
      });

      // Audit Log on success
      if (user?.id) {
        await this.prisma.auditLog
          .create({
            data: {
              userId: user.id,
              actorSnapshot: `${user.firstName || ''} ${user.lastName || ''} (@${user.email || user.username || 'unknown'}) [${user.role || 'USER'}]`.trim(),
              action: 'UPLOAD_FILE',
              entity: 'Upload',
              entityId: result.id,
              status: 'SUCCESS',
              newValues: {
                fileName: uniqueName,
                folder: safeFolder,
                size: file.size,
                mimeType: file.mimetype,
                establishmentId: user.establishmentId,
                tenantId: user.tenantId,
              },
            },
          })
          .catch((err) => this.logger.warn(`Failed to write upload audit log: ${err.message}`));
      }

      return result;
    } catch (error: any) {
      if (user?.id) {
        await this.prisma.systemLog
          .create({
            data: {
              level: 'ERROR',
              message: `Upload failure: ${error.message}`,
              stack: error.stack,
              context: 'UploadService.saveFile',
              userId: user?.id,
            },
          })
          .catch((err) => this.logger.warn(`Failed to write system error log: ${err.message}`));
      }
      throw error;
    }
  }

  async deleteFile(fileName: string, folder = 'general', user?: any): Promise<boolean> {
    try {
      const safeFolder = this.sanitizeFolder(folder);
      const safeFileName = path.basename(fileName);
      const fullPath = path.resolve(this.baseUploadDir, safeFolder, safeFileName);
      if (!fullPath.startsWith(path.resolve(this.baseUploadDir))) {
        throw new BadRequestException('Path traversal forbidden');
      }

      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
        return true;
      }
      return false;
    } catch (error: any) {
      this.logger.error(`Error deleting file: ${error.message}`);
      throw error;
    }
  }
}
