'use client';

import { useState, useCallback } from 'react';
import { CalendarEvent } from '@/types/event';

interface ContextMenuState {
  x: number;
  y: number;
  event: CalendarEvent | null;
}

export function useContextMenu() {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const showContextMenu = useCallback((e: React.MouseEvent, event: CalendarEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    // Ensure menu doesn't go off-screen
    const maxX = window.innerWidth - 200; // Approximate menu width
    const maxY = window.innerHeight - 300; // Approximate menu height
    
    setContextMenu({
      x: Math.min(x, maxX),
      y: Math.min(y, maxY),
      event
    });
  }, []);

  const hideContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleKeyboardShortcut = useCallback((e: KeyboardEvent, event: CalendarEvent | null) => {
    if (!event) return false;

    // Handle keyboard shortcuts for context menu actions
    switch (e.key.toLowerCase()) {
      case 'delete':
      case 'backspace':
        if (e.ctrlKey || e.metaKey) {
          return true; // Let parent handle deletion
        }
        break;
      case 'd':
        if (e.ctrlKey || e.metaKey) {
          return true; // Let parent handle duplication
        }
        break;
      case 'e':
        if (e.ctrlKey || e.metaKey) {
          return true; // Let parent handle editing
        }
        break;
    }
    return false;
  }, []);

  return {
    contextMenu,
    showContextMenu,
    hideContextMenu,
    handleKeyboardShortcut
  };
}