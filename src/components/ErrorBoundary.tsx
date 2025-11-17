'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="bg-card border-2 border-destructive max-w-2xl w-full spacing-mathematical">
            <div className="flex items-center gap-3 mb-4">
              <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h1 className="text-2xl font-bold text-destructive font-mono uppercase tracking-wider">
                [ERROR]
              </h1>
            </div>
            <p className="text-foreground mb-4 font-mono">
              Something went wrong. The application encountered an unexpected error.
            </p>
            {this.state.error && (
              <div className="bg-muted border border-border p-4 mb-4 font-mono text-sm">
                <div className="text-muted-foreground mb-2">[ERROR_DETAILS]</div>
                <div className="text-foreground">{this.state.error.message}</div>
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="brutalist-button bg-primary text-primary-foreground border-primary w-full font-bold"
              style={{ padding: 'var(--space-md) var(--space-xl)' }}
            >
              [RELOAD_APP]
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
