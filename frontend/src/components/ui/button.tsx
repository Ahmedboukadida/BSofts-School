import { clsx } from 'clsx';
import { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'coral' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
          {
            'bg-brand text-white hover:bg-brand-hover focus:ring-brand/30 shadow-sm shadow-brand/20 active:scale-[0.98]': variant === 'primary',
            'bg-surface text-text-primary border border-border hover:bg-surface-hover focus:ring-brand/20': variant === 'secondary' || variant === 'outline',
            'bg-coral text-white hover:opacity-90 focus:ring-coral/30 shadow-sm shadow-coral/20 active:scale-[0.98]': variant === 'danger' || variant === 'coral',
            'text-text-secondary hover:bg-surface-hover hover:text-text-primary focus:ring-brand/20': variant === 'ghost',
          },
          {
            'h-8 px-3 text-xs': size === 'sm',
            'h-10 px-5 text-sm': size === 'md',
            'h-12 px-7 text-sm': size === 'lg',
          },
          {
            'opacity-50 cursor-not-allowed pointer-events-none': disabled || isLoading,
          },
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
