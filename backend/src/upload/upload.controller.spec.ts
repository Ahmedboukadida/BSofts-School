import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { UploadEntity } from './upload.entity';

describe('UploadController', () => {
  let controller: UploadController;
  let service: any;

  beforeEach(() => {
    service = {
      saveFile: vi.fn(),
      deleteFile: vi.fn(),
    };
    controller = new UploadController(service as UploadService);
  });

  it('should upload a single file', async () => {
    const file = {
      originalname: 'document.pdf',
      mimetype: 'application/pdf',
      size: 1024,
      buffer: Buffer.from('pdf'),
    };
    const entity = new UploadEntity({
      id: 'up-1',
      originalName: 'document.pdf',
      fileName: 'rand.pdf',
      mimeType: 'application/pdf',
      size: 1024,
      url: '/uploads/docs/rand.pdf',
    });
    service.saveFile.mockResolvedValue(entity);

    const result = await controller.uploadSingle(file, { folder: 'docs' }, { user: { id: 'u1' } });
    expect(result).toEqual(entity);
    expect(service.saveFile).toHaveBeenCalledWith(file, 'docs', { id: 'u1' });
  });

  it('should upload multiple files', async () => {
    const files = [
      { originalname: '1.pdf', mimetype: 'application/pdf', size: 100, buffer: Buffer.from('1') },
      { originalname: '2.pdf', mimetype: 'application/pdf', size: 200, buffer: Buffer.from('2') },
    ];
    service.saveFile.mockResolvedValue(new UploadEntity({ id: 'up-x' }));

    const results = await controller.uploadMultiple(files, { folder: 'batch' }, { user: { id: 'u1' } });
    expect(results).toHaveLength(2);
    expect(service.saveFile).toHaveBeenCalledTimes(2);
  });
});
