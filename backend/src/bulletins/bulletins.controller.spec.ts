import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BulletinsController } from './bulletins.controller';
import { BulletinsService } from './bulletins.service';

describe('BulletinsController', () => {
  let controller: BulletinsController;
  let serviceMock: any;

  beforeEach(() => {
    serviceMock = {
      findAll: vi.fn(),
      findOne: vi.fn(),
      getDetailedBulletin: vi.fn(),
      generateForClass: vi.fn(),
      generatePdf: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    };

    controller = new BulletinsController(serviceMock as BulletinsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should call service.findAll with query', async () => {
      const query = { classId: 'cls-1', periodId: 'p-1' } as any;
      serviceMock.findAll.mockResolvedValue({ data: [], total: 0 });

      const res = await controller.findAll(query);
      expect(serviceMock.findAll).toHaveBeenCalledWith(query);
      expect(res).toEqual({ data: [], total: 0 });
    });
  });

  describe('generate', () => {
    it('should trigger class calculation via service.generateForClass', async () => {
      const body = { classId: 'cls-1', periodId: 'per-1' };
      const user = { userId: 'u-admin' };
      serviceMock.generateForClass.mockResolvedValue({ count: 25, message: 'Success' });

      const res = await controller.generate(body, user);
      expect(serviceMock.generateForClass).toHaveBeenCalledWith('cls-1', 'per-1', user);
      expect(res.count).toBe(25);
    });
  });

  describe('getDetailed', () => {
    it('should return detailed bulletin data', async () => {
      serviceMock.getDetailedBulletin.mockResolvedValue({ id: 'b-123', subjects: [] });
      const res = await controller.getDetailed('b-123');
      expect(serviceMock.getDetailedBulletin).toHaveBeenCalledWith('b-123');
      expect(res.id).toBe('b-123');
    });
  });

  describe('downloadPdf', () => {
    it('should stream generated PDF with correct headers', async () => {
      const mockPdfBuffer = Buffer.from('%PDF-1.4 Mock PDF content');
      serviceMock.generatePdf.mockResolvedValue(mockPdfBuffer);

      const resMock: any = {
        set: vi.fn(),
        end: vi.fn(),
      };

      await controller.downloadPdf('b-123', resMock);

      expect(serviceMock.generatePdf).toHaveBeenCalledWith('b-123');
      expect(resMock.set).toHaveBeenCalledWith({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=bulletin-b-123.pdf',
        'Content-Length': mockPdfBuffer.length,
      });
      expect(resMock.end).toHaveBeenCalledWith(mockPdfBuffer);
    });
  });
});
