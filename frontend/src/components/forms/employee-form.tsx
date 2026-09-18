'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { useTranslation } from '@/components/providers/i18n-provider';

interface EmployeeFormProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId?: string | null;
  onSuccess: () => void;
}

interface EmployeeData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  position: string;
  hireDate: string;
  bio: string;
}

export function EmployeeForm({ isOpen, onClose, employeeId, onSuccess }: EmployeeFormProps) {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [formData, setFormData] = useState<EmployeeData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    position: '',
    hireDate: '',
    bio: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchEmployee = useCallback(async () => {
    if (!employeeId) return;
    try {
      const response = await api.get(`/employees/${employeeId}`);
      const employee = response.data;
      setFormData({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        phone: employee.phone || '',
        email: employee.email || '',
        address: employee.address || '',
        position: employee.position || '',
        hireDate: employee.hireDate ? new Date(employee.hireDate).toISOString().split('T')[0] : '',
        bio: employee.bio || '',
      });
    } catch (err) {
      console.error('Failed to fetch employee:', err);
    }
  }, [employeeId]);

  const resetForm = useCallback(() => {
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      address: '',
      position: '',
      hireDate: '',
      bio: '',
    });
    setError('');
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (employeeId) {
        fetchEmployee();
      } else {
        resetForm();
      }
    }
  }, [isOpen, employeeId, fetchEmployee, resetForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        establishmentId: user?.establishmentId,
      };
      if (employeeId) {
        await api.patch(`/employees/${employeeId}`, formData);
      } else {
        await api.post('/employees', payload);
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
      title={employeeId ? t('crud.editEmployee') : t('crud.addEmployee')}
      size="6xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-coral/5 text-coral text-sm rounded-xl">
            {error}
          </div>
        )}

        <div className="border border-border rounded-xl p-4">
          <h4 className="text-sm font-semibold text-text-primary mb-3">{t('sections.personalInformation')}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('pages.firstName')}
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
            <Input
              label={t('pages.lastName')}
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
            <Input
              label={t('common.email')}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </div>

        <div className="border border-border rounded-xl p-4">
          <h4 className="text-sm font-semibold text-text-primary mb-3">{t('sections.employment')}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('crud.position')}
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              required
            />
            <Input
              label={t('crud.hireDate')}
              type="date"
              value={formData.hireDate}
              onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
            />
            <Input
              label={t('common.phone')}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label={t('common.address')}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <Textarea
              label={t('common.bio')}
              value={formData.bio || ''}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {employeeId ? t('common.update') : t('common.create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
