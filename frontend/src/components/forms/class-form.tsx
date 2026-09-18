'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { useTranslation } from '@/components/providers/i18n-provider';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';

interface ClassFormProps {
  isOpen: boolean;
  onClose: () => void;
  classId?: string | null;
  onSuccess: () => void;
}

interface ClassData {
  name: string;
  code: string;
  classLevelId: string;
  academicYearId: string;
  periodType: string;
  maxStudents: number;
  description: string;
}

export function ClassForm({ isOpen, onClose, classId, onSuccess }: ClassFormProps) {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [formData, setFormData] = useState<ClassData>({
    name: '',
    code: '',
    classLevelId: '',
    academicYearId: '',
    periodType: 'TRIMESTER',
    maxStudents: 40,
    description: '',
  });
  const [classLevels, setClassLevels] = useState<{ id: string; name: string }[]>([]);
  const [academicYears, setAcademicYears] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchClassLevels = useCallback(async () => {
    try {
      const response = await api.get('/class-levels?limit=100');
      setClassLevels(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch class levels:', err);
    }
  }, []);

  const fetchAcademicYears = useCallback(async () => {
    try {
      const response = await api.get('/academic-years?limit=100');
      setAcademicYears(response.data.data || []);
    } catch (err) {
      console.error('Failed to fetch academic years:', err);
    }
  }, []);

  const fetchClass = useCallback(async () => {
    if (!classId) return;
    try {
      const response = await api.get(`/classes/${classId}`);
      const cls = response.data;
      setFormData({
        name: cls.name || '',
        code: cls.code || '',
        classLevelId: cls.classLevelId || '',
        academicYearId: cls.academicYearId || '',
        periodType: cls.periodType || 'TRIMESTER',
        maxStudents: cls.maxStudents || 40,
        description: cls.description || '',
      });
    } catch (err) {
      console.error('Failed to fetch class:', err);
    }
  }, [classId]);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      code: '',
      classLevelId: '',
      academicYearId: '',
      periodType: 'TRIMESTER',
      maxStudents: 40,
      description: '',
    });
    setError('');
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchClassLevels();
      fetchAcademicYears();
      if (classId) {
        fetchClass();
      } else {
        resetForm();
      }
    }
  }, [isOpen, classId, fetchClassLevels, fetchAcademicYears, fetchClass, resetForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        establishmentId: user?.establishmentId,
      };
      if (classId) {
        await api.patch(`/classes/${classId}`, formData);
      } else {
        await api.post('/classes', payload);
      }
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } };
      setError(errorObj.response?.data?.message || t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={classId ? t('pages.editClass') : t('pages.addClass')}
      size="6xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-coral/5 text-coral text-sm rounded-xl">
            {error}
          </div>
        )}

        <div className="border border-border rounded-xl p-4">
          <h4 className="text-sm font-semibold text-text-primary mb-3">{t('sections.basicInfo')}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('pages.classesTitle')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label={t('common.code')}
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
            <Input
              label={t('common.maxStudents')}
              type="number"
              value={formData.maxStudents}
              onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) || 40 })}
            />
          </div>
        </div>

        <div className="border border-border rounded-xl p-4">
          <h4 className="text-sm font-semibold text-text-primary mb-3">{t('sections.academic')}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label={t('common.level')}
              value={formData.classLevelId}
              onChange={(e) => setFormData({ ...formData, classLevelId: e.target.value })}
              options={[
                { value: '', label: t('common.selectLevel') },
                ...classLevels.map((l) => ({ value: l.id, label: l.name })),
              ]}
            />
            <Select
              label={t('common.year')}
              value={formData.academicYearId}
              onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value })}
              options={[
                { value: '', label: t('common.selectYear') },
                ...academicYears.map((y) => ({ value: y.id, label: y.name })),
              ]}
            />
            <Select
              label={t('common.type')}
              value={formData.periodType}
              onChange={(e) => setFormData({ ...formData, periodType: e.target.value })}
              options={[
                { value: 'TRIMESTER', label: t('common.trimester') },
                { value: 'SEMESTER', label: t('common.semester') },
              ]}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {classId ? t('common.save') : t('common.create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
