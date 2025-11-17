'use client';

import { useToast } from '@/contexts/ToastContext';

export default function ToastContainer() {
  const { toasts, hideToast } = useToast();

  const getToastStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-secondary text-secondary-foreground border-secondary';
      case 'error':
        return 'bg-destructive text-destructive-foreground border-destructive';
      case 'warning':
        return 'bg-chart-4 text-background border-chart-4';
      case 'info':
      default:
        return 'bg-accent text-accent-foreground border-accent';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-md">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 border-2 font-mono shadow-lg animate-in slide-in-from-right-4 duration-300 ${getToastStyles(toast.type)}`}
          style={{ padding: 'var(--space-md) var(--space-lg)' }}
          role="alert"
          aria-live="polite"
        >
          <div className="flex-shrink-0">{getIcon(toast.type)}</div>
          <div className="flex-1 font-medium text-sm">{toast.message}</div>
          <button
            onClick={() => hideToast(toast.id)}
            className="flex-shrink-0 hover:opacity-70 transition-opacity"
            aria-label="Close notification"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
