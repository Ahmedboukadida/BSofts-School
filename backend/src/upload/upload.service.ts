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
  private readonly baseUploadDir: string;

  constructor(private readonly prisma: PrismaService) {
    const frontendPublic = path.resolve(process.cwd(), '..', 'frontend', 'public');
    if (fs.existsSync(frontendPublic)) {
      this.baseUploadDir = path.join(frontendPublic, 'uploads');
    } else {
      this.baseUploadDir = path.join(process.cwd(), 'uploads');
    }

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

  private validateMagicBytes(buffer: Buffer, mimetype: string): void {
    if (!buffer || buffer.length < 4) {
      throw new BadRequestException('Empty or corrupt file payload');
    }

    // 1. Strict executable blacklisting
    // Windows PE (.exe, .dll, .sys)
    if (buffer[0] === 0x4d && buffer[1] === 0x5a) {
      throw new BadRequestException('Executable files (Windows PE) are strictly forbidden');
    }
    // Linux ELF (.so, binaries)
    if (buffer[0] === 0x7f && buffer[1] === 0x45 && buffer[2] === 0x4c && buffer[3] === 0x46) {
      throw new BadRequestException('Executable files (ELF binaries) are strictly forbidden');
    }
    // Unix Script / Shebang (#! /bin/sh, etc.)
    if (buffer[0] === 0x23 && buffer[1] === 0x21) {
      throw new BadRequestException('Executable script files are strictly forbidden');
    }

    // 2. MIME signature verification
    switch (mimetype) {
      case 'image/jpeg':
        if (!(buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff)) {
          throw new BadRequestException('Invalid JPEG format signature');
        }
        break;
      case 'image/png':
        if (
          !(
            buffer[0] === 0x89 &&
            buffer[1] === 0x50 &&
            buffer[2] === 0x4e &&
            buffer[3] === 0x47
          )
        ) {
          throw new BadRequestException('Invalid PNG format signature');
        }
        break;
      case 'image/gif':
        if (
          !(
            buffer[0] === 0x47 &&
            buffer[1] === 0x49 &&
            buffer[2] === 0x46 &&
            buffer[3] === 0x38
          )
        ) {
          throw new BadRequestException('Invalid GIF format signature');
        }
        break;
      case 'image/webp':
        if (
          !(
            buffer[0] === 0x52 &&
            buffer[1] === 0x49 &&
            buffer[2] === 0x46 &&
            buffer[3] === 0x46 &&
            buffer.length >= 12 &&
            buffer[8] === 0x57 &&
            buffer[9] === 0x45 &&
            buffer[10] === 0x42 &&
            buffer[11] === 0x50
          )
        ) {
          throw new BadRequestException('Invalid WebP format signature');
        }
        break;
      case 'application/pdf':
        if (
          !(
            buffer[0] === 0x25 &&
            buffer[1] === 0x50 &&
            buffer[2] === 0x44 &&
            buffer[3] === 0x46
          )
        ) {
          throw new BadRequestException('Invalid PDF format signature (%PDF)');
        }
        break;
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        // Modern OpenXML documents are ZIP archives starting with PK (0x50, 0x4B, 0x03, 0x04)
        if (
          !(
            buffer[0] === 0x50 &&
            buffer[1] === 0x4b &&
            buffer[2] === 0x03 &&
            buffer[3] === 0x04
          )
        ) {
          throw new BadRequestException('Invalid Office OpenXML format signature');
        }
        break;
      case 'application/msword':
      case 'application/vnd.ms-excel':
        // Legacy OLE2 Compound Document format (D0 CF 11 E0) or ZIP
        const isOLE =
          buffer[0] === 0xd0 &&
          buffer[1] === 0xcf &&
          buffer[2] === 0x11 &&
          buffer[3] === 0xe0;
        const isZIP =
          buffer[0] === 0x50 &&
          buffer[1] === 0x4b &&
          buffer[2] === 0x03 &&
          buffer[3] === 0x04;
        if (!isOLE && !isZIP) {
          throw new BadRequestException('Invalid Microsoft Office binary signature');
        }
        break;
      case 'text/csv':
      case 'text/plain':
        // Text files should not contain null bytes in their leading bytes
        const inspectLen = Math.min(buffer.length, 512);
        for (let i = 0; i < inspectLen; i++) {
          if (buffer[i] === 0x00) {
            throw new BadRequestException('Binary data detected in text file payload');
          }
        }
        break;
    }
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

      // Sniff magic bytes to prevent masqueraded files (.exe renamed to .pdf)
      this.validateMagicBytes(file.buffer, file.mimetype);

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
