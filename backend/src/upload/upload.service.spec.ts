import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { UploadService, MAX_UPLOAD_FILE_SIZE } from './upload.service';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';

vi.mock('fs', async () => {
  const actual: any = await vi.importActual('fs');
  return {
    ...actual,
    existsSync: vi.fn().mockReturnValue(true),
    mkdirSync: vi.fn(),
    writeFileSync: vi.fn(),
    unlinkSync: vi.fn(),
  };
});

describe('UploadService', () => {
  let service: UploadService;
  let prisma: any;

  beforeEach(() => {
    prisma = {
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: 'aud-1' }),
      },
      systemLog: {
        create: vi.fn().mockResolvedValue({ id: 'sys-1' }),
      },
    };
    service = new UploadService(prisma);
  });

  describe('saveFile', () => {
    it('should throw BadRequestException if no file provided', async () => {
      await expect(service.saveFile(null as any)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if file exceeds 10MB', async () => {
      const largeFile = {
        originalname: 'large.pdf',
        mimetype: 'application/pdf',
        size: MAX_UPLOAD_FILE_SIZE + 1024,
        buffer: Buffer.from('oversized-content'),
      };
      await expect(service.saveFile(largeFile)).rejects.toThrow('File size exceeds the 10MB limit');
    });

    it('should throw BadRequestException if MIME type is not allowed', async () => {
      const exeFile = {
        originalname: 'malicious.exe',
        mimetype: 'application/x-msdownload',
        size: 1024,
        buffer: Buffer.from('MZ...'),
      };
      await expect(service.saveFile(exeFile)).rejects.toThrow('Unsupported file type');
    });

    it('should throw BadRequestException on directory traversal attempt', async () => {
      const validFile = {
        originalname: 'test.png',
        mimetype: 'image/png',
        size: 1024,
        buffer: Buffer.from('png-data'),
      };
      await expect(service.saveFile(validFile, '../../../etc')).rejects.toThrow(
        'Invalid upload folder path traversal detected',
      );
    });

    it('should save valid file and create audit log', async () => {
      const validFile = {
        originalname: 'avatar.png',
        mimetype: 'image/png',
        size: 2048,
        buffer: Buffer.from('valid-png-data'),
      };
      const user = {
        id: 'u1',
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@bsofts.com',
        role: 'ADMIN',
        establishmentId: 'est-1',
        tenantId: 'ten-1',
      };

      const result = await service.saveFile(validFile, 'avatars', user);

      expect(result).toBeDefined();
      expect(result.originalName).toBe('avatar.png');
      expect(result.mimeType).toBe('image/png');
      expect(result.url).toContain('/uploads/avatars/');
      expect(prisma.auditLog.create).toHaveBeenCalled();
    });
  });

  describe('deleteFile', () => {
    it('should throw BadRequestException if folder contains path traversal', async () => {
      await expect(service.deleteFile('file.png', '../../../etc')).rejects.toThrow(
        'Invalid upload folder path traversal detected',
      );
    });

    it('should delete file if it exists', async () => {
      const deleted = await service.deleteFile('file.png', 'avatars');
      expect(deleted).toBe(true);
      expect(fs.unlinkSync).toHaveBeenCalled();
    });
  });
});
