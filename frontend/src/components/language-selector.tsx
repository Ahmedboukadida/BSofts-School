'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { useTranslation, Locale } from '@/components/providers/i18n-provider';
import { clsx } from 'clsx';

export const locales: { code: Locale; label: string; fullName: string }[] = [
  { code: 'fr', label: 'FR', fullName: 'Français' },
  { code: 'en', label: 'EN', fullName: 'English' },
  { code: 'ar', label: 'AR', fullName: 'العربية' },
];

interface LanguageSelectorProps {
  variant?: 'default' | 'glass';
  className?: string;
}

export function LanguageSelector({ variant = 'default', className }: LanguageSelectorProps) {
  const { locale, setLocale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const active = locales.find((l) => l.code === locale) || locales[0];

  return (
    <div ref={ref} className={clsx('relative inline-block', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer select-none border',
          variant === 'glass'
            ? 'bg-white text-[#242F40] border-[#E5E5E5] hover:bg-[#E5E5E5]/40 shadow-xs'
            : 'bg-white text-[#242F40] border-[#E5E5E5] hover:bg-[#E5E5E5]/40 shadow-xs'
        )}
        aria-label="Select language"
      >
        <span className="font-mono tracking-wider font-extrabold text-[#CCA43B]">{active.label}</span>
        <ChevronDown
          className={clsx(
            'w-3 h-3 text-[#363636] transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-40 rounded-2xl shadow-premium-lg py-1.5 z-50 bg-white border border-[#E5E5E5] animate-scale-in"
        >
          {locales.map((item) => {
            const isSelected = locale === item.code;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => {
                  setLocale(item.code);
                  setIsOpen(false);
                }}
                className={clsx(
                  'flex items-center justify-between w-full px-3.5 py-2 text-xs transition-all duration-150 cursor-pointer',
                  isSelected
                    ? 'bg-[#CCA43B]/10 text-[#242F40] font-bold'
                    : 'text-[#363636] hover:bg-[#E5E5E5]/50'
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono font-black text-[12px] text-[#CCA43B]">{item.label}</span>
                  <span className="text-[12px] font-medium text-[#242F40]">{item.fullName}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#CCA43B] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
