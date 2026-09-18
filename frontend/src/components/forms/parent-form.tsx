'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { useTranslation } from '@/components/providers/i18n-provider';

interface ParentFormProps {
  isOpen: boolean;
  onClose: () => void;
  parentId?: string | null;
  onSuccess: () => void;
}

interface ParentData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  occupation: string;
}

export function ParentForm({ isOpen, onClose, parentId, onSuccess }: ParentFormProps) {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ParentData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    occupation: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchParent = useCallback(async () => {
    if (!parentId) return;
    try {
      const response = await api.get(`/parents/${parentId}`);
      const parent = response.data;
      setFormData({
        firstName: parent.firstName || '',
        lastName: parent.lastName || '',
        phone: parent.phone || '',
        email: parent.email || '',
        address: parent.address || '',
        occupation: parent.occupation || '',
      });
    } catch (err) {
      console.error('Failed to fetch parent:', err);
    }
  }, [parentId]);

  const resetForm = useCallback(() => {
    setFormData({
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      address: '',
      occupation: '',
    });
    setError('');
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (parentId) {
        fetchParent();
      } else {
        resetForm();
      }
    }
  }, [isOpen, parentId, fetchParent, resetForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        establishmentId: user?.establishmentId,
      };
      if (parentId) {
        await api.patch(`/parents/${parentId}`, formData);
      } else {
        await api.post('/parents', payload);
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
      title={parentId ? t('crud.editParent') : t('crud.addParent')}
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
          </div>
        </div>

        <div className="border border-border rounded-xl p-4">
          <h4 className="text-sm font-semibold text-text-primary mb-3">{t('sections.contact')}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('common.phone')}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label={t('common.email')}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label={t('common.address')}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
          </div>
        </div>

        <div className="border border-border rounded-xl p-4">
          <h4 className="text-sm font-semibold text-text-primary mb-3">{t('sections.other')}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('crud.occupation')}
              value={formData.occupation}
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {parentId ? t('common.update') : t('common.create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
