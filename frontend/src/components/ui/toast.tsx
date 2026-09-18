'use client';

import { useState, createContext, useContext, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  status?: number;
  duration?: number;
}

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  status?: number;
}

export interface ToastContextType {
  showToast: (message: string, type?: ToastType, options?: ToastOptions) => void;
  showStatusToast: (status: number, message: string, options?: Omit<ToastOptions, 'status'>) => void;
  showApiResponseToast: (res: { status?: number; data?: any; message?: any }, fallbackSuccess?: string) => void;
  showApiErrorToast: (err: any, fallbackError?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'info', options?: ToastOptions) => {
      const id = Math.random().toString(36).slice(2);
      const duration = options?.duration ?? (type === 'error' ? 7000 : 5000);
      setToasts((prev) => [...prev, { id, message, type, status: options?.status }]);
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const showStatusToast = useCallback(
    (status: number, message: string, options?: Omit<ToastOptions, 'status'>) => {
      let type: ToastType = 'info';
      if (status >= 200 && status < 300) {
        type = 'success';
      } else if (status >= 300 && status < 400) {
        type = 'warning';
      } else if (status >= 400) {
        type = 'error';
      }
      showToast(message, type, { ...options, status });
    },
    [showToast]
  );

  const showApiResponseToast = useCallback(
    (res: { status?: number; data?: any; message?: any }, fallbackSuccess = 'Opération effectuée avec succès') => {
      const status = res?.status ?? 200;
      let msg = fallbackSuccess;
      if (typeof res?.message === 'string' && res.message.trim().length > 0) {
        msg = res.message;
      } else if (res?.data && typeof res.data.message === 'string' && res.data.message.trim().length > 0) {
        msg = res.data.message;
      }
      showStatusToast(status, msg);
    },
    [showStatusToast]
  );

  const showApiErrorToast = useCallback(
    (err: any, fallbackError = 'Une erreur inattendue est survenue') => {
      const response = err?.response || err;
      const status = response?.status || 500;
      const data = response?.data;

      let extractedMessage = fallbackError;

      if (data) {
        if (Array.isArray(data.message)) {
          extractedMessage = data.message.join(' • ');
        } else if (typeof data.message === 'string' && data.message.trim().length > 0) {
          extractedMessage = data.message;
        } else if (typeof data.error === 'string' && data.error.trim().length > 0) {
          extractedMessage = data.error;
        }
      } else if (typeof err?.message === 'string' && err.message.trim().length > 0) {
        extractedMessage = err.message;
      }

      showStatusToast(status, extractedMessage);
    },
    [showStatusToast]
  );

  const getStatusBadge = (status?: number) => {
    if (!status) return null;
    return (
      <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#363636] text-[#FFFFFF] shrink-0 border border-[#E5E5E5]">
        {status}
      </span>
    );
  };

  const getBorderColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'border-l-[#CCA43B] bg-[#FFFFFF]';
      case 'warning':
        return 'border-l-[#CCA43B] bg-[#FFFFFF]';
      case 'error':
        return 'border-l-[#242F40] bg-[#FFFFFF]';
      case 'info':
      default:
        return 'border-l-[#363636] bg-[#FFFFFF]';
    }
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-[#CCA43B] shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-[#CCA43B] shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-[#242F40] shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-[#363636] shrink-0" />;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, showStatusToast, showApiResponseToast, showApiErrorToast }}>
      {children}
      <div
        className="fixed bottom-6 left-6 right-6 sm:left-auto sm:right-6 z-50 space-y-3 max-w-md w-full"
        aria-live="polite"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={clsx(
              'flex items-start gap-3 px-4 py-3 border border-[#E5E5E5] rounded-xl shadow-lg animate-toast border-l-4 text-[#363636] transition-all',
              getBorderColor(toast.type)
            )}
          >
            <div className="pt-0.5">{getIcon(toast.type)}</div>
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                {getStatusBadge(toast.status)}
                <span className="text-xs font-bold uppercase tracking-wider text-[#242F40]">
                  {toast.type === 'success'
                    ? 'Succès'
                    : toast.type === 'warning'
                    ? 'Attention'
                    : toast.type === 'error'
                    ? 'Erreur'
                    : 'Information'}
                </span>
              </div>
              <p className="text-sm font-medium text-[#363636] break-words">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg text-[#363636] hover:bg-[#E5E5E5] transition-colors shrink-0"
              aria-label="Dismiss"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
