'use client';

import { useEffect } from 'react';

interface ShortcutGroup {
  title: string;
  shortcuts: {
    keys: string[];
    description: string;
  }[];
}

interface KeyboardShortcutsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsPanel({ isOpen, onClose }: KeyboardShortcutsPanelProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortcutGroups: ShortcutGroup[] = [
    {
      title: 'General',
      shortcuts: [
        { keys: ['?'], description: 'Show keyboard shortcuts' },
        { keys: ['Ctrl', 'K'], description: 'Open command palette' },
        { keys: ['Ctrl', 'Q'], description: 'Quick add event' },
        { keys: ['N'], description: 'Create new event' },
        { keys: ['T'], description: 'Open templates' },
        { keys: ['S'], description: 'Toggle search' },
        { keys: ['/'], description: 'Focus search' },
        { keys: ['Esc'], description: 'Close dialog/modal' },
      ],
    },
    {
      title: 'Navigation',
      shortcuts: [
        { keys: ['1'], description: 'Switch to Week view' },
        { keys: ['2'], description: 'Switch to Day view' },
        { keys: ['3'], description: 'Switch to Month view' },
        { keys: ['4'], description: 'Switch to Agenda view' },
        { keys: ['H', '←'], description: 'Previous period' },
        { keys: ['L', '→'], description: 'Next period' },
        { keys: ['G'], description: 'Go to today' },
      ],
    },
    {
      title: 'Vim Mode (when enabled)',
      shortcuts: [
        { keys: ['H'], description: 'Move left' },
        { keys: ['J'], description: 'Move down' },
        { keys: ['K'], description: 'Move up' },
        { keys: ['L'], description: 'Move right' },
        { keys: ['Enter'], description: 'Select/Create event' },
        { keys: ['?'], description: 'Toggle hints' },
      ],
    },
    {
      title: 'Event Actions',
      shortcuts: [
        { keys: ['E'], description: 'Edit selected event' },
        { keys: ['D'], description: 'Delete selected event' },
        { keys: ['Ctrl', 'D'], description: 'Duplicate event' },
        { keys: ['Ctrl', 'Z'], description: 'Undo last action' },
        { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo action' },
      ],
    },
    {
      title: 'Export & Import',
      shortcuts: [
        { keys: ['Ctrl', 'E'], description: 'Export calendar' },
        { keys: ['Ctrl', 'I'], description: 'Import events' },
        { keys: ['Ctrl', 'P'], description: 'Print view' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-card shadow-2xl w-full max-w-5xl transform transition-all max-h-[90vh] overflow-y-auto border border-border spacing-mathematical">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-card-foreground mb-1 font-mono uppercase tracking-wider">
              [KEYBOARD_SHORTCUTS]
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground font-mono">
              Press <kbd className="px-2 py-1 bg-muted text-foreground border border-border font-mono text-xs">?</kbd> anytime to view shortcuts
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground hover:bg-muted p-2 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {shortcutGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="bg-muted/50 border border-border spacing-mathematical">
              <h4 className="text-lg font-bold text-foreground mb-4 font-mono uppercase tracking-wide">
                [{group.title.toUpperCase().replace(' ', '_')}]
              </h4>
              <div className="space-y-3">
                {group.shortcuts.map((shortcut, shortcutIndex) => (
                  <div key={shortcutIndex} className="flex items-center justify-between gap-4">
                    <div className="flex-1 text-sm text-muted-foreground font-mono">
                      {shortcut.description}
                    </div>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex} className="flex items-center gap-1">
                          <kbd className="px-3 py-1.5 bg-card text-foreground border-2 border-border font-mono text-sm font-bold shadow-sm min-w-[2.5rem] text-center">
                            {key}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="text-muted-foreground">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <div className="bg-accent/20 border border-accent spacing-mathematical">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm font-mono text-muted-foreground">
                <div className="font-bold text-foreground mb-1">[PRO_TIP]</div>
                Most shortcuts work globally. For Vim mode navigation, make sure Vim mode is enabled in settings.
                Use <kbd className="px-2 py-1 bg-muted text-foreground border border-border font-mono text-xs">Ctrl+K</kbd> to access all features via command palette.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
