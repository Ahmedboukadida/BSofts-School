import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExamsService } from './exams.service';

describe('ExamsService - Online MCQ Engine', () => {
  let service: ExamsService;
  let prismaMock: any;

  beforeEach(() => {
    prismaMock = {
      exam: {
        findMany: vi.fn(),
        count: vi.fn(),
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      examQuestion: {
        count: vi.fn().mockResolvedValue(0),
        create: vi.fn(),
        findFirst: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
      examSubmission: {
        findUnique: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        findMany: vi.fn(),
      },
      examAnswer: {
        create: vi.fn(),
      },
      student: {
        findFirst: vi.fn(),
      },
      auditLog: {
        create: vi.fn().mockResolvedValue({ id: 'audit-1' }),
      },
      systemLog: {
        create: vi.fn().mockResolvedValue({ id: 'sys-1' }),
      },
    };

    service = new ExamsService(prismaMock);
  });

  it('should add a QCM question to an exam', async () => {
    prismaMock.exam.findUnique.mockResolvedValue({ id: 'exam-123' });
    prismaMock.examQuestion.create.mockResolvedValue({
      id: 'q-1',
      examId: 'exam-123',
      type: 'QCM',
      content: 'Capital of Tunisia?',
      options: [
        { id: 'A', text: 'Tunis', isCorrect: true },
        { id: 'B', text: 'Sfax', isCorrect: false },
      ],
      maxScore: 5,
      sortOrder: 1,
    });

    const result = await service.addQuestion(
      'exam-123',
      {
        type: 'QCM',
        content: 'Capital of Tunisia?',
        options: [
          { id: 'A', text: 'Tunis', isCorrect: true },
          { id: 'B', text: 'Sfax', isCorrect: false },
        ],
        maxScore: 5,
        sortOrder: 1,
      },
      { id: 'u1', role: 'TEACHER' },
    );

    expect(result.id).toBe('q-1');
    expect(prismaMock.examQuestion.create).toHaveBeenCalled();
  });

  it('should start online exam for student and strip isCorrect from questions', async () => {
    prismaMock.exam.findUnique.mockResolvedValue({
      id: 'exam-123',
      isOnline: true,
      title: 'History Quiz',
      maxScore: 20,
      questions: [
        {
          id: 'q-1',
          type: 'QCM',
          content: 'Capital of Tunisia?',
          options: [
            { id: 'A', text: 'Tunis', isCorrect: true },
            { id: 'B', text: 'Sfax', isCorrect: false },
          ],
          maxScore: 5,
          sortOrder: 1,
        },
      ],
      class: { id: 'c-1', name: '4eme Info' },
      matiere: { id: 'm-1', name: 'Histoire' },
    });
    prismaMock.student.findFirst.mockResolvedValue({ id: 's-123' });
    prismaMock.examSubmission.findUnique.mockResolvedValue(null);
    prismaMock.examSubmission.create.mockResolvedValue({
      id: 'sub-1',
      startedAt: new Date(),
      status: 'IN_PROGRESS',
    });

    const result = await service.startExam('exam-123', { id: 'user-stud-1', role: 'STUDENT' });

    expect(result.submission.id).toBe('sub-1');
    expect(result.questions).toHaveLength(1);
    // Crucial anti-cheat check: isCorrect must NOT be sent to student!
    expect((result.questions[0].options as any[])[0].isCorrect).toBeUndefined();
    expect((result.questions[0].options as any[])[1].isCorrect).toBeUndefined();
  });

  it('should auto-grade QCM questions upon submission', async () => {
    prismaMock.exam.findUnique.mockResolvedValue({
      id: 'exam-123',
      maxScore: 20,
      questions: [
        {
          id: 'q-1',
          type: 'QCM',
          maxScore: 5,
          options: [
            { id: 'A', text: 'Tunis', isCorrect: true },
            { id: 'B', text: 'Sfax', isCorrect: false },
          ],
        },
        {
          id: 'q-2',
          type: 'TRUE_FALSE',
          maxScore: 5,
          options: [
            { id: 'true', text: 'Vrai', isCorrect: true },
            { id: 'false', text: 'Faux', isCorrect: false },
          ],
        },
      ],
    });
    prismaMock.student.findFirst.mockResolvedValue({ id: 's-123' });
    prismaMock.examSubmission.findUnique.mockResolvedValue({
      id: 'sub-1',
      status: 'IN_PROGRESS',
    });
    prismaMock.examAnswer.create.mockResolvedValue({ id: 'ans-1' });
    prismaMock.examSubmission.update.mockResolvedValue({
      id: 'sub-1',
      totalScore: 10,
      status: 'GRADED',
      submittedAt: new Date(),
    });

    const result = await service.submitExam(
      'exam-123',
      { id: 'user-stud-1' },
      {
        answers: [
          { questionId: 'q-1', answer: 'A' },
          { questionId: 'q-2', answer: 'true' },
        ],
        tabSwitches: 1,
      },
    );

    expect(result.status).toBe('GRADED');
    expect(result.totalScore).toBe(10);
    expect(prismaMock.examSubmission.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          totalScore: 10,
          status: 'GRADED',
          tabSwitches: 1,
        }),
      }),
    );
  });
});
