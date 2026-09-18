'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { useTranslation } from '@/components/providers/i18n-provider';

interface ExamFormProps {
  isOpen: boolean;
  onClose: () => void;
  examId?: string | null;
  onSuccess: () => void;
}

interface ExamData {
  title: string;
  description: string;
  type: string;
  classId: string;
  periodId: string;
  matiereId: string;
  academicYearId: string;
  maxScore: number;
  duration: string;
  startTime: string;
  endTime: string;
  isOnline: boolean;
  antiCheat: boolean;
  maxAttempts: number;
}

export function ExamForm({ isOpen, onClose, examId, onSuccess }: ExamFormProps) {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ExamData>({
    title: '',
    description: '',
    type: 'QUIZ',
    classId: '',
    periodId: '',
    matiereId: '',
    academicYearId: '',
    maxScore: 20,
    duration: '',
    startTime: '',
    endTime: '',
    isOnline: false,
    antiCheat: false,
    maxAttempts: 1,
  });
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [periods, setPeriods] = useState<{ id: string; name: string }[]>([]);
  const [matieres, setMatieres] = useState<{ id: string; name: string }[]>([]);
  const [academicYears, setAcademicYears] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchDropdowns = useCallback(async () => {
    try {
      const [classesRes, periodsRes, matieresRes, yearsRes] = await Promise.all([
        api.get('/classes?limit=100'),
        api.get('/academic-periods?limit=100'),
        api.get('/matieres?limit=100'),
        api.get('/academic-years?limit=100'),
      ]);
      setClasses(classesRes.data.data || []);
      setPeriods(periodsRes.data.data || []);
      setMatieres(matieresRes.data.data || []);
      setAcademicYears(yearsRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch dropdowns:', err);
    }
  }, []);

  const fetchExam = useCallback(async () => {
    if (!examId) return;
    try {
      const response = await api.get(`/exams/${examId}`);
      const exam = response.data;
      setFormData({
        title: exam.title || '',
        description: exam.description || '',
        type: exam.type || 'QUIZ',
        classId: exam.classId || '',
        periodId: exam.periodId || '',
        matiereId: exam.matiereId || '',
        academicYearId: exam.academicYearId || '',
        maxScore: exam.maxScore || 20,
        duration: exam.duration?.toString() || '',
        startTime: exam.startTime ? new Date(exam.startTime).toISOString().slice(0, 16) : '',
        endTime: exam.endTime ? new Date(exam.endTime).toISOString().slice(0, 16) : '',
        isOnline: exam.isOnline || false,
        antiCheat: exam.antiCheat || false,
        maxAttempts: exam.maxAttempts || 1,
      });
    } catch (err) {
      console.error('Failed to fetch exam:', err);
    }
  }, [examId]);

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      description: '',
      type: 'QUIZ',
      classId: '',
      periodId: '',
      matiereId: '',
      academicYearId: '',
      maxScore: 20,
      duration: '',
      startTime: '',
      endTime: '',
      isOnline: false,
      antiCheat: false,
      maxAttempts: 1,
    });
    setError('');
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchDropdowns();
      if (examId) {
        fetchExam();
      } else {
        resetForm();
      }
    }
  }, [isOpen, examId, fetchDropdowns, fetchExam, resetForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        maxScore: Number(formData.maxScore),
        duration: formData.duration ? Number(formData.duration) : undefined,
        establishmentId: user?.establishmentId,
      };
      if (examId) {
        await api.patch(`/exams/${examId}`, payload);
      } else {
        await api.post('/exams', payload);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: { message?: string }; message?: string } } };
      setError(errorObj.response?.data?.error?.message || errorObj.response?.data?.message || t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={examId ? t('crud.editExam') : t('crud.createExamTitle')}
      size="6xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-coral/5 text-coral text-sm rounded-xl">
            {error}
          </div>
        )}

        <div className="border border-border rounded-xl p-4">
          <h4 className="text-sm font-semibold text-text-primary mb-3">{t('sections.examDetails')}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('crud.name')}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Textarea
              label={t('common.description')}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <Select
              label={t('crud.type')}
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={[
                { value: 'QUIZ', label: t('examTypes.typeQuiz') || 'Quiz' },
                { value: 'MIDTERM', label: t('examTypes.typeMidterm') || 'Midterm' },
                { value: 'FINAL', label: t('examTypes.typeFinal') || 'Final' },
                { value: 'HOMEWORK', label: t('examTypes.typeHomework') || 'Homework' },
                { value: 'PRACTICAL', label: t('examTypes.typePractical') || 'Practical' },
                { value: 'OTHER', label: t('examTypes.typeOther') || 'Other' },
              ]}
            />
          </div>
        </div>

        <div className="border border-border rounded-xl p-4">
          <h4 className="text-sm font-semibold text-text-primary mb-3">{t('sections.academic')}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label={t('crud.class')}
              value={formData.classId}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
              options={[
                { value: '', label: t('crud.selectClass') },
                ...classes.map((c) => ({ value: c.id, label: c.name })),
              ]}
            />
            <Select
              label={t('crud.academicYear')}
              value={formData.academicYearId}
              onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value })}
              options={[
                { value: '', label: t('crud.selectYear') },
                ...academicYears.map((y) => ({ value: y.id, label: y.name })),
              ]}
            />
            <Select
              label={t('crud.period')}
              value={formData.periodId}
              onChange={(e) => setFormData({ ...formData, periodId: e.target.value })}
              options={[
                { value: '', label: t('crud.selectPeriod') },
                ...periods.map((p) => ({ value: p.id, label: p.name })),
              ]}
            />
            <Select
              label={t('crud.subject')}
              value={formData.matiereId}
              onChange={(e) => setFormData({ ...formData, matiereId: e.target.value })}
              options={[
                { value: '', label: t('crud.selectSubject') },
                ...matieres.map((m) => ({ value: m.id, label: m.name })),
              ]}
            />
          </div>
        </div>

        <div className="border border-border rounded-xl p-4">
          <h4 className="text-sm font-semibold text-text-primary mb-3">{t('sections.settings')}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('crud.maxScore')}
              type="number"
              value={formData.maxScore}
              onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) || 20 })}
            />
            <Input
              label={t('crud.duration')}
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            />
            <Input
              label={t('crud.startTime')}
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            />
            <Input
              label={t('crud.endTime')}
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isOnline"
                checked={formData.isOnline}
                onChange={(e) => setFormData({ ...formData, isOnline: e.target.checked })}
                className="rounded border-border"
              />
              <label htmlFor="isOnline" className="text-sm text-text-primary">
                {t('crud.isOnline') || 'Online'}
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="antiCheat"
                checked={formData.antiCheat}
                onChange={(e) => setFormData({ ...formData, antiCheat: e.target.checked })}
                className="rounded border-border"
              />
              <label htmlFor="antiCheat" className="text-sm text-text-primary">
                {t('crud.antiCheat') || 'Anti-Cheat'}
              </label>
            </div>
            <Input
              label={t('crud.maxAttempts') || 'Max Attempts'}
              type="number"
              value={formData.maxAttempts}
              onChange={(e) => setFormData({ ...formData, maxAttempts: parseInt(e.target.value) || 1 })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {examId ? t('common.update') : t('common.create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
