import { clsx } from 'clsx';
import { forwardRef, useId } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id: externalId, ...props }, ref) => {
    const generatedId = useId();
    const id = externalId || generatedId;

    return (
      <div className="space-y-1.5">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-text-primary">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={clsx(
            'w-full h-10 px-3 bg-surface border rounded-lg text-sm text-text-primary placeholder:text-text-tertiary transition-colors duration-200',
            'focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand',
            {
              'border-border': !error,
              'border-destructive focus:ring-destructive/20 focus:border-destructive': error,
            },
            className
          )}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
          {...props}
        />
        {error && (
          <p id={`${id}-error`} className="text-xs text-destructive">{error}</p>
        )}
        {hint && !error && (
          <p id={`${id}-hint`} className="text-xs text-text-tertiary">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
