import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BulletinsService } from './bulletins.service';
import { NotFoundException } from '@nestjs/common';

describe('BulletinsService', () => {
  let service: BulletinsService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      bulletin: {
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
        upsert: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      note: {
        findMany: vi.fn(),
      },
      class: {
        findUnique: vi.fn(),
      },
      establishment: {
        findFirst: vi.fn(),
      },
    };

    service = new BulletinsService(prismaMock);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDetailedBulletin', () => {
    it('should throw NotFoundException if bulletin not found', async () => {
      prismaMock.bulletin.findUnique.mockResolvedValue(null);
      await expect(service.getDetailedBulletin('b-999')).rejects.toThrow(NotFoundException);
    });

    it('should return detailed bulletin with grouped subject notes and class stats', async () => {
      const mockBulletin = {
        id: 'b-1',
        studentId: 's-1',
        classId: 'c-1',
        periodId: 'p-1',
        averageScore: 14.5,
        totalScore: 145.0,
        rank: 2,
        isPromoted: true,
        comments: 'Admis',
        student: { id: 's-1', firstName: 'Mohamed', lastName: 'Ben Ali', registrationNumber: 'STU001' },
        class: {
          id: 'c-1',
          name: '4ème Sciences',
          code: '4SC',
          classLevel: { name: 'Terminale' },
          academicYear: { name: '2025-2026' },
          establishment: { name: 'Lycée Pilote', phone: '+216 71 000 000', email: 'contact@lp.tn' },
        },
        period: { id: 'p-1', name: 'Trimestre 1' },
      };

      prismaMock.bulletin.findUnique.mockResolvedValue(mockBulletin);
      prismaMock.note.findMany.mockResolvedValue([
        {
          id: 'n-1',
          studentId: 's-1',
          periodId: 'p-1',
          matiereId: 'm-1',
          value: 15,
          maxValue: 20,
          coefficient: 1,
          matiere: { id: 'm-1', name: 'Mathématiques', code: 'MATH', coefficient: 4 },
          exam: { title: 'Devoir de Contrôle N°1', type: 'QUIZ' },
        },
        {
          id: 'n-2',
          studentId: 's-1',
          periodId: 'p-1',
          matiereId: 'm-1',
          value: 17,
          maxValue: 20,
          coefficient: 2,
          matiere: { id: 'm-1', name: 'Mathématiques', code: 'MATH', coefficient: 4 },
          exam: { title: 'Devoir de Synthèse N°1', type: 'FINAL' },
        },
      ]);
      prismaMock.bulletin.findMany.mockResolvedValue([
        { averageScore: 14.5 },
        { averageScore: 16.0 },
        { averageScore: 11.0 },
      ]);

      const result = await service.getDetailedBulletin('b-1');

      expect(result.id).toBe('b-1');
      expect(result.subjects).toHaveLength(1);
      expect(result.subjects[0].name).toBe('Mathématiques');
      expect(result.subjects[0].average).toBeGreaterThan(0);
      expect(result.classStatistics.totalStudents).toBe(3);
      expect(result.classStatistics.maxAverage).toBe(16.0);
      expect(result.classStatistics.minAverage).toBe(11.0);
    });
  });

  describe('generatePdf', () => {
    it('should generate a valid PDF Buffer with report card layout', async () => {
      const mockBulletin = {
        id: 'b-1',
        studentId: 's-1',
        classId: 'c-1',
        periodId: 'p-1',
        averageScore: 15.25,
        totalScore: 152.5,
        rank: 1,
        isPromoted: true,
        comments: 'Admis avec félicitations',
        student: {
          id: 's-1',
          firstName: 'Aymen',
          lastName: 'Trabelsi',
          registrationNumber: 'STU-2026',
          dateOfBirth: '2008-05-12T00:00:00.000Z',
        },
        class: {
          id: 'c-1',
          name: '3ème Informatique',
          classLevel: { name: '3ème Année' },
          academicYear: { name: '2025-2026' },
          establishment: {
            name: 'Collège & Lycée Ibn Khaldoun',
            address: 'Avenue Habib Bourguiba, Tunis',
            phone: '+216 71 123 456',
            email: 'administration@ibn-khaldoun.ed.tn',
          },
        },
        period: { id: 'p-1', name: 'Trimestre 1' },
      };

      prismaMock.bulletin.findUnique.mockResolvedValue(mockBulletin);
      prismaMock.note.findMany.mockResolvedValue([
        {
          id: 'n-1',
          studentId: 's-1',
          periodId: 'p-1',
          matiereId: 'm-algo',
          value: 16,
          maxValue: 20,
          coefficient: 1.5,
          matiere: { id: 'm-algo', name: 'Algorithmique & Programmation', coefficient: 3 },
          exam: { title: 'DC1', type: 'QUIZ' },
        },
        {
          id: 'n-2',
          studentId: 's-1',
          periodId: 'p-1',
          matiereId: 'm-phys',
          value: 14.5,
          maxValue: 20,
          coefficient: 1,
          matiere: { id: 'm-phys', name: 'Sciences Physiques', coefficient: 2 },
          exam: { title: 'DC1', type: 'QUIZ' },
        },
      ]);
      prismaMock.bulletin.findMany.mockResolvedValue([
        { averageScore: 15.25 },
        { averageScore: 12.0 },
      ]);

      const buffer = await service.generatePdf('b-1');

      expect(Buffer.isBuffer(buffer)).toBe(true);
      expect(buffer.length).toBeGreaterThan(500); // Standard A4 PDF should have substantial byte content
      expect(buffer.toString('utf-8', 0, 5)).toBe('%PDF-'); // Valid PDF magic bytes header
    });
  });
});
