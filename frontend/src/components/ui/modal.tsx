'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, size = 'lg', footer }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
        className={clsx(
          'bg-surface rounded-3xl shadow-premium-xl w-full max-h-[90vh] animate-modal border border-border/50 flex flex-col',
          {
            'max-w-sm': size === 'sm',
            'max-w-md': size === 'md',
            'max-w-lg': size === 'lg',
            'max-w-xl': size === 'xl',
            'max-w-2xl': size === '2xl',
            'max-w-3xl': size === '3xl',
            'max-w-4xl': size === '4xl',
            'max-w-5xl': size === '5xl',
            'max-w-6xl': size === '6xl',
            'max-w-7xl': size === '7xl',
            'max-w-[96vw] max-h-[94vh]': size === 'full',
          }
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/30 shrink-0">
          <h2 id="modal-title" className="text-lg font-bold text-text-primary tracking-tight">{title}</h2>
          <button onClick={onClose}
            className="p-2 rounded-xl text-text-tertiary hover:bg-surface-hover hover:text-text-primary transition-all duration-200"
            aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 py-5 overflow-y-auto flex-1 min-h-0">
          {children}
        </div>
        {footer && (
          <div className="px-6 py-4 border-t border-border/30 flex items-center justify-end gap-3 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── WIZARD / STEPPER ─── */

interface WizardStep {
  label: string;
  description?: string;
}

interface WizardProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function Wizard({ steps, currentStep, onStepClick }: WizardProps) {
  return (
    <div className="flex items-center gap-2 mb-6">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-2">
          <button
            onClick={() => onStepClick?.(i)}
            disabled={!onStepClick}
            className={clsx(
              'flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
              i === currentStep
                ? 'bg-brand text-white shadow-md shadow-brand/20'
                : i < currentStep
                ? 'bg-brand/10 text-brand'
                : 'bg-surface-hover text-text-tertiary',
              onStepClick && 'cursor-pointer hover:opacity-80'
            )}
          >
            <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: i < currentStep ? 'rgba(57,61,148,0.15)' : i === currentStep ? 'rgba(255,255,255,0.2)' : 'transparent' }}>
              {i < currentStep ? '✓' : i + 1}
            </span>
            <span className="hidden sm:inline">{step.label}</span>
          </button>
          {i < steps.length - 1 && (
            <div className={clsx('w-8 h-0.5 rounded-full', i < currentStep ? 'bg-brand/30' : 'bg-border')} />
          )}
        </div>
      ))}
    </div>
  );
}
