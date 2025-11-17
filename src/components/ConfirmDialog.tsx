'use client';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'destructive';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const confirmClass = confirmVariant === 'destructive'
    ? 'bg-destructive text-destructive-foreground border-destructive hover:bg-destructive/90'
    : 'bg-primary text-primary-foreground border-primary hover:bg-primary/90';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div
        className="bg-card border-2 border-border w-full max-w-md spacing-mathematical"
        role="alertdialog"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
      >
        <h3
          id="dialog-title"
          className="text-xl font-bold text-foreground font-mono uppercase tracking-wider mb-4"
        >
          {title}
        </h3>
        <p
          id="dialog-description"
          className="text-muted-foreground mb-6 font-mono"
        >
          {message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className={`flex-1 brutalist-button ${confirmClass} font-bold`}
            style={{ padding: 'var(--space-md) var(--space-xl)' }}
            autoFocus
          >
            [{confirmText.toUpperCase()}]
          </button>
          <button
            onClick={onCancel}
            className="flex-1 brutalist-button bg-muted text-muted-foreground border-muted hover:bg-muted-foreground hover:text-background font-bold"
            style={{ padding: 'var(--space-md) var(--space-xl)' }}
          >
            [{cancelText.toUpperCase()}]
          </button>
        </div>
      </div>
    </div>
  );
}
