'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { useTranslation } from '@/components/providers/i18n-provider';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  isLoading?: boolean;
  variant?: 'danger' | 'primary';
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  isLoading,
  variant = 'danger',
}: ConfirmDialogProps) {
  const { t } = useTranslation();
  const resolvedConfirmLabel = confirmLabel || t('common.confirm');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4 w-full">
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-xl ${variant === 'danger' ? 'bg-destructive/10' : 'bg-brand-muted'}`}>
            <AlertTriangle className={`w-5 h-5 ${variant === 'danger' ? 'text-destructive' : 'text-brand'}`} />
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">{message}</p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            {t('common.cancel')}
          </Button>
          <Button variant={variant} onClick={onConfirm} isLoading={isLoading}>
            {resolvedConfirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
