'use client';

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <div className="relative w-16 h-16 mb-4">
        <div className="absolute inset-0 border-4 border-muted"></div>
        <div className="absolute inset-0 border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
      <p className="text-muted-foreground font-mono uppercase tracking-wider text-sm">
        [{message}]
      </p>
    </div>
  );
}
