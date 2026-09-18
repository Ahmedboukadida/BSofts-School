'use client';
import { Modal, Wizard } from './modal';
import { Button } from './button';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
  isLoading?: boolean;
  error?: string;
  onSubmit?: (e: React.FormEvent) => void;
  submitLabel?: string;
  cancelLabel?: string;
  children: React.ReactNode;
  /** Wizard mode: provide steps + currentStep + onStepChange */
  steps?: { label: string; description?: string }[];
  currentStep?: number;
  onStepChange?: (step: number) => void;
  /** Hide footer (submit/cancel) — useful in wizard mode where buttons are per-step */
  hideFooter?: boolean;
}

export function FormModal({
  isOpen,
  onClose,
  title,
  size = '4xl',
  isLoading,
  error,
  onSubmit,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  children,
  steps,
  currentStep,
  onStepChange,
  hideFooter = false,
}: FormModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size={size}>
      {steps && currentStep !== undefined && (
        <Wizard steps={steps} currentStep={currentStep} onStepClick={onStepChange} />
      )}
      {error && (
        <div className="p-4 bg-coral/5 border border-coral/10 text-coral text-sm rounded-2xl mb-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-coral/10 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold">!</span>
          </div>
          {error}
        </div>
      )}
      <div className="flex-1 min-h-0">{children}</div>
      {!hideFooter && onSubmit && (
        <div className="flex justify-end gap-3 pt-4 border-t border-border/30 mt-4 shrink-0">
          <Button type="button" variant="secondary" onClick={onClose} className="rounded-2xl">{cancelLabel}</Button>
          <Button type="submit" onClick={onSubmit} isLoading={isLoading} className="rounded-2xl shadow-lg shadow-brand/20">{submitLabel}</Button>
        </div>
      )}
    </Modal>
  );
}
