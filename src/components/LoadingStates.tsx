'use client';

import { ReactNode } from 'react';

// ==========================================================================
// Loading Spinner
// ==========================================================================

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

export function LoadingSpinner({ size = 'md', label = 'Loading...', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className={`inline-flex items-center gap-3 ${className}`} role="status" aria-live="polite">
      <div 
        className={`loading-spinner ${sizeClasses[size]}`}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
      <span className="font-mono text-sm text-muted-foreground" aria-hidden="true">
        [{label.toUpperCase().replace(/ /g, '_')}]
      </span>
    </div>
  );
}

// ==========================================================================
// Skeleton Loaders
// ==========================================================================

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string;
  height?: string;
  'aria-label'?: string;
}

export function Skeleton({ 
  className = '', 
  variant = 'rectangular',
  width,
  height,
  'aria-label': ariaLabel = 'Loading content'
}: SkeletonProps) {
  const variantClasses = {
    text: 'h-4 w-full',
    rectangular: 'h-20 w-full',
    circular: 'h-12 w-12 rounded-full'
  };

  const style = {
    width: width || undefined,
    height: height || undefined
  };

  return (
    <div 
      className={`skeleton ${variantClasses[variant]} ${className}`}
      style={style}
      aria-busy="true"
      aria-label={ariaLabel}
      role="status"
    />
  );
}

// ==========================================================================
// Skeleton Event Card
// ==========================================================================

export function SkeletonEventCard() {
  return (
    <div className="bg-card border-2 border-border spacing-mathematical" role="status" aria-label="Loading event">
      <div className="flex items-start gap-3">
        <Skeleton variant="circular" width="3rem" height="3rem" aria-label="Loading icon" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="70%" aria-label="Loading title" />
          <Skeleton variant="text" width="50%" aria-label="Loading time" />
          <Skeleton variant="text" width="90%" aria-label="Loading description" />
        </div>
      </div>
    </div>
  );
}

// ==========================================================================
// Loading Overlay
// ==========================================================================

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  children: ReactNode;
}

export function LoadingOverlay({ isLoading, message = 'Loading...', children }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div 
          className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
          role="status"
          aria-live="polite"
        >
          <LoadingSpinner label={message} size="lg" />
        </div>
      )}
    </div>
  );
}

// ==========================================================================
// Progress Bar
// ==========================================================================

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  variant?: 'primary' | 'success' | 'warning' | 'error';
  className?: string;
}

export function ProgressBar({ 
  value, 
  label, 
  showPercentage = true,
  variant = 'primary',
  className = ''
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, value));
  
  const variantColors = {
    primary: 'bg-primary',
    success: 'bg-chart-5',
    warning: 'bg-chart-3',
    error: 'bg-destructive'
  };

  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="font-mono text-sm font-bold">[{label.toUpperCase().replace(/ /g, '_')}]</span>
          {showPercentage && (
            <span className="font-mono text-sm text-muted-foreground">{percentage}%</span>
          )}
        </div>
      )}
      <div 
        className="w-full h-3 bg-muted border-2 border-border overflow-hidden"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      >
        <div 
          className={`h-full ${variantColors[variant]} transition-all duration-300 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ==========================================================================
// Success Animation
// ==========================================================================

interface SuccessAnimationProps {
  message?: string;
  onComplete?: () => void;
}

export function SuccessAnimation({ message = 'Success!', onComplete }: SuccessAnimationProps) {
  return (
    <div 
      className="flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-300"
      role="status"
      aria-live="polite"
      onAnimationEnd={onComplete}
    >
      <div className="w-16 h-16 rounded-full bg-chart-5 border-4 border-foreground flex items-center justify-center mb-4 animate-in zoom-in duration-500">
        <svg className="w-10 h-10 text-background" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <span className="font-mono font-bold text-xl uppercase tracking-wider">
        [{message.toUpperCase().replace(/ /g, '_')}]
      </span>
    </div>
  );
}

// ==========================================================================
// Error Animation
// ==========================================================================

interface ErrorAnimationProps {
  message?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorAnimation({ message = 'Error occurred', onRetry, onDismiss }: ErrorAnimationProps) {
  return (
    <div 
      className="flex flex-col items-center justify-center p-8 animate-in fade-in shake duration-300"
      role="alert"
      aria-live="assertive"
    >
      <div className="w-16 h-16 rounded-full bg-destructive border-4 border-foreground flex items-center justify-center mb-4">
        <svg className="w-10 h-10 text-destructive-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </div>
      <span className="font-mono font-bold text-xl uppercase tracking-wider text-destructive mb-4">
        [{message.toUpperCase().replace(/ /g, '_')}]
      </span>
      <div className="flex gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="brutalist-button bg-primary text-primary-foreground"
          >
            [RETRY]
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="brutalist-button bg-secondary text-secondary-foreground"
          >
            [DISMISS]
          </button>
        )}
      </div>
    </div>
  );
}

// ==========================================================================
// Empty State
// ==========================================================================

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      {icon && (
        <div className="w-24 h-24 mb-6 text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="font-mono font-bold text-2xl uppercase tracking-wider mb-3">
        [{title.toUpperCase().replace(/ /g, '_')}]
      </h3>
      {description && (
        <p className="text-muted-foreground font-mono mb-6 max-w-md">
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="brutalist-button bg-primary text-primary-foreground"
        >
          [{action.label.toUpperCase().replace(/ /g, '_')}]
        </button>
      )}
    </div>
  );
}
