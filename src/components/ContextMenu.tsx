'use client';

import { useEffect, useRef } from 'react';
import { CalendarEvent } from '@/types/event';

interface ContextMenuProps {
  x: number;
  y: number;
  event: CalendarEvent | null;
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
  onDuplicate: (event: CalendarEvent) => void;
}

export default function ContextMenu({
  x,
  y,
  event,
  onClose,
  onEdit,
  onDelete,
  onDuplicate
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [onClose]);

  if (!event) return null;

  const menuActions = [
    {
      id: 'edit',
      label: '[EDIT]',
      icon: '⚒',
      action: () => {
        onEdit(event);
        onClose();
      },
      shortcut: 'E'
    },
    {
      id: 'duplicate',
      label: '[DUPLICATE]',
      icon: '⎘',
      action: () => {
        onDuplicate(event);
        onClose();
      },
      shortcut: 'D'
    },
    {
      id: 'delete',
      label: '[DELETE]',
      icon: '⚠',
      action: () => {
        if (confirm(`Delete "${event.title}"?`)) {
          onDelete(event.id);
          onClose();
        }
      },
      shortcut: 'Del',
      destructive: true
    }
  ];

  return (
    <div 
      ref={menuRef}
      className="fixed z-[9999] bg-card border-2 border-border"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        padding: 'var(--space-xs)'
      }}
    >
      {/* Header */}
      <div className="border-b-2 border-border mb-2" style={{padding: 'var(--space-sm)'}}>
        <div className="font-mono font-bold text-foreground text-xs uppercase tracking-wider truncate">
          {event.title}
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          {event.date.toLocaleDateString()} • {event.startTime}
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-1">
        {menuActions.map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            className={`w-full text-left font-mono text-xs uppercase tracking-wide transition-all duration-150 border-2 flex items-center justify-between ${
              action.destructive 
                ? 'bg-destructive text-destructive-foreground border-destructive hover:bg-destructive/80' 
                : 'bg-background text-foreground border-border hover:bg-foreground hover:text-background'
            }`}
            style={{padding: 'var(--space-sm) var(--space-md)'}}
          >
            <div className="flex items-center gap-2">
              <span>{action.icon}</span>
              <span>{action.label}</span>
            </div>
            <span className="text-xs opacity-70">{action.shortcut}</span>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t-2 border-border mt-2 pt-2 text-center font-mono text-xs text-muted-foreground">
        [ESC_TO_CLOSE]
      </div>
    </div>
  );
}