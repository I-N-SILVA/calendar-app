'use client';

import { useEffect, useState } from 'react';

interface VimNavigationOptions {
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  onSelect?: () => void;
  onEscape?: () => void;
  enabled?: boolean;
}

export function useVimNavigation(options: VimNavigationOptions) {
  const [isVimMode, setIsVimMode] = useState(false);
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    if (!options.enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Toggle vim mode with 'v'
      if (e.key === 'v' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsVimMode(prev => !prev);
        return;
      }

      // Show keyboard hints with '?'
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShowHints(prev => !prev);
        return;
      }

      // Vim navigation (only if vim mode is active)
      if (isVimMode) {
        switch (e.key) {
          case 'h':
            e.preventDefault();
            options.onMoveLeft?.();
            break;
          case 'j':
            e.preventDefault();
            options.onMoveDown?.();
            break;
          case 'k':
            e.preventDefault();
            options.onMoveUp?.();
            break;
          case 'l':
            e.preventDefault();
            options.onMoveRight?.();
            break;
          case 'Enter':
          case ' ':
            e.preventDefault();
            options.onSelect?.();
            break;
          case 'Escape':
            e.preventDefault();
            options.onEscape?.();
            setIsVimMode(false);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVimMode, options]);

  return {
    isVimMode,
    showHints,
    setShowHints
  };
}