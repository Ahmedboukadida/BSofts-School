'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { useTranslation } from '@/components/providers/i18n-provider';

interface HolidayFormProps {
  isOpen: boolean;
  onClose: () => void;
  holidayId?: string | null;
  onSuccess: () => void;
}

interface HolidayData {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  isRecurring: boolean;
}

export function HolidayForm({ isOpen, onClose, holidayId, onSuccess }: HolidayFormProps) {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [formData, setFormData] = useState<HolidayData>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    isRecurring: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchHoliday = useCallback(async () => {
    if (!holidayId) return;
    try {
      const response = await api.get(`/holidays/${holidayId}`);
      const holiday = response.data;
      setFormData({
        name: holiday.name || '',
        description: holiday.description || '',
        startDate: holiday.startDate ? new Date(holiday.startDate).toISOString().split('T')[0] : '',
        endDate: holiday.endDate ? new Date(holiday.endDate).toISOString().split('T')[0] : '',
        isRecurring: holiday.isRecurring || false,
      });
    } catch (err) {
      console.error('Failed to fetch holiday:', err);
    }
  }, [holidayId]);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      isRecurring: false,
    });
    setError('');
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (holidayId) {
        fetchHoliday();
      } else {
        resetForm();
      }
    }
  }, [isOpen, holidayId, fetchHoliday, resetForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        establishmentId: user?.establishmentId,
      };
      if (holidayId) {
        await api.patch(`/holidays/${holidayId}`, formData);
      } else {
        await api.post('/holidays', payload);
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
      title={holidayId ? t('crud.editHoliday') : t('crud.addHoliday')}
      size="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-coral/5 text-coral text-sm rounded-xl">
            {error}
          </div>
        )}

        <div className="border border-border rounded-xl p-4">
          <h4 className="text-sm font-semibold text-text-primary mb-3">{t('sections.holidayDetails')}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('common.name')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Textarea
              label={t('common.description')}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        <div className="border border-border rounded-xl p-4">
          <h4 className="text-sm font-semibold text-text-primary mb-3">{t('sections.schedule')}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('pages.startDate')}
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <Input
              label={t('pages.endDate')}
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isRecurring"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                className="rounded border-border"
              />
              <label htmlFor="isRecurring" className="text-sm text-text-primary">
                {t('crud.isRecurring') || 'Recurring holiday'}
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {holidayId ? t('common.update') : t('common.create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
