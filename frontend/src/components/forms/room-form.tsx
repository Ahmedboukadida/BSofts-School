'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth-store';
import { useTranslation } from '@/components/providers/i18n-provider';

interface RoomFormProps {
  isOpen: boolean;
  onClose: () => void;
  roomId?: string | null;
  onSuccess: () => void;
}

interface RoomData {
  name: string;
  code: string;
  type: string;
  capacity: number;
  floor: string;
  building: string;
  description: string;
}

export function RoomForm({ isOpen, onClose, roomId, onSuccess }: RoomFormProps) {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [formData, setFormData] = useState<RoomData>({
    name: '',
    code: '',
    type: 'CLASSROOM',
    capacity: 30,
    floor: '',
    building: '',
    description: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRoom = useCallback(async () => {
    if (!roomId) return;
    try {
      const response = await api.get(`/rooms/${roomId}`);
      const room = response.data;
      setFormData({
        name: room.name || '',
        code: room.code || '',
        type: room.type || 'CLASSROOM',
        capacity: room.capacity || 30,
        floor: room.floor?.toString() || '',
        building: room.building || '',
        description: room.description || '',
      });
    } catch (err) {
      console.error('Failed to fetch room:', err);
    }
  }, [roomId]);

  const resetForm = useCallback(() => {
    setFormData({
      name: '',
      code: '',
      type: 'CLASSROOM',
      capacity: 30,
      floor: '',
      building: '',
      description: '',
    });
    setError('');
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (roomId) {
        fetchRoom();
      } else {
        resetForm();
      }
    }
  }, [isOpen, roomId, fetchRoom, resetForm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        capacity: Number(formData.capacity),
        floor: formData.floor ? Number(formData.floor) : undefined,
        establishmentId: user?.establishmentId,
      };
      if (roomId) {
        await api.patch(`/rooms/${roomId}`, payload);
      } else {
        await api.post('/rooms', payload);
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
      title={roomId ? t('crud.editRoom') : t('crud.addRoom')}
      size="6xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-coral/5 text-coral text-sm rounded-xl">
            {error}
          </div>
        )}

        <div className="border border-border rounded-xl p-4">
          <h4 className="text-sm font-semibold text-text-primary mb-3">{t('sections.roomInfo')}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('common.name')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label={t('crud.roomCode')}
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            />
            <Select
              label={t('crud.type')}
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              options={[
                { value: 'CLASSROOM', label: t('roomTypes.typeClassroom') || 'Classroom' },
                { value: 'LABORATORY', label: t('roomTypes.typeLaboratory') || 'Laboratory' },
                { value: 'LIBRARY', label: t('roomTypes.typeLibrary') || 'Library' },
                { value: 'GYM', label: t('roomTypes.typeGym') || 'Gym' },
                { value: 'AUDITORIUM', label: t('roomTypes.typeAuditorium') || 'Auditorium' },
                { value: 'COMPUTER_LAB', label: t('roomTypes.typeComputerLab') || 'Computer Lab' },
                { value: 'ART_ROOM', label: t('roomTypes.typeArtRoom') || 'Art Room' },
                { value: 'MUSIC_ROOM', label: t('roomTypes.typeMusicRoom') || 'Music Room' },
                { value: 'OTHER', label: t('roomTypes.typeOther') || 'Other' },
              ]}
            />
          </div>
        </div>

        <div className="border border-border rounded-xl p-4">
          <h4 className="text-sm font-semibold text-text-primary mb-3">{t('sections.details')}</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('crud.capacity')}
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 30 })}
              required
            />
            <Input
              label={t('crud.floor')}
              type="number"
              value={formData.floor}
              onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
            />
            <Input
              label={t('crud.building')}
              value={formData.building}
              onChange={(e) => setFormData({ ...formData, building: e.target.value })}
            />
            <Input
              label={t('common.description')}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" isLoading={isLoading}>
            {roomId ? t('common.update') : t('common.create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
