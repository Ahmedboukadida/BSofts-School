'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
}

export function FormSection({ title, children, collapsible = false, defaultOpen = true }: FormSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-border rounded-xl overflow-hidden mb-4">
      <button
        type="button"
        onClick={() => collapsible && setIsOpen(!isOpen)}
        className={clsx(
          'w-full flex items-center justify-between px-4 py-3 bg-surface',
          collapsible && 'hover:bg-surface-hover cursor-pointer transition-colors duration-200'
        )}
        disabled={!collapsible}
      >
        <h4 className="text-sm font-medium text-text-primary">{title}</h4>
        {collapsible && (
          <ChevronDown
            className={clsx(
              'w-4 h-4 text-text-tertiary transition-transform duration-200',
              isOpen && 'rotate-180'
            )}
          />
        )}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 pt-1 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}
