'use client';

import { useState, useEffect, useRef } from 'react';
import { CalendarEvent } from '@/types/event';
import { fuzzySearch, getHighlightSegments, FuzzyMatch, HighlightSegment } from '@/utils/fuzzySearch';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent: () => void;
  events: CalendarEvent[];
  onEventSelect: (event: CalendarEvent) => void;
}

interface Command {
  id: string;
  label: string;
  highlightedLabel?: React.ReactNode;
  description: string;
  action: () => void;
  shortcut?: string;
  match?: FuzzyMatch;
}

export default function CommandPalette({ 
  isOpen, 
  onClose, 
  onCreateEvent, 
  events,
  onEventSelect 
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const baseCommands: Command[] = [
    {
      id: 'create-event',
      label: '[CREATE] New Event',
      description: 'Create a new calendar event',
      action: () => {
        onCreateEvent();
        onClose();
      },
      shortcut: 'N'
    },
    {
      id: 'today',
      label: '[TODAY] Go to Today',
      description: 'Navigate to today\'s date',
      action: () => {
        // This would need to be passed as prop or handled differently
        onClose();
      },
      shortcut: 'T'
    },
    {
      id: 'week-view',
      label: '[VIEW] Week View',
      description: 'Switch to week view',
      action: () => {
        // This would need to be passed as prop
        onClose();
      },
      shortcut: 'W'
    },
    {
      id: 'month-view',
      label: '[VIEW] Month View', 
      description: 'Switch to month view',
      action: () => {
        // This would need to be passed as prop
        onClose();
      },
      shortcut: 'M'
    },
    {
      id: 'day-view',
      label: '[VIEW] Day View',
      description: 'Switch to day view',
      action: () => {
        // This would need to be passed as prop
        onClose();
      },
      shortcut: 'D'
    }
  ];

  // Filter events based on fuzzy search
  const filteredEvents = query.length > 0 
    ? events.map(event => {
        const titleMatch = fuzzySearch(query, event.title);
        const descMatch = event.description ? fuzzySearch(query, event.description) : { score: -1, text: '', matches: [] };
        const bestMatch = titleMatch.score > descMatch.score ? titleMatch : descMatch;
        return { event, match: bestMatch };
      })
      .filter(({ match }) => match.score >= 0)
      .sort((a, b) => b.match.score - a.match.score)
      .slice(0, 5)
    : [];

  // Convert filtered events to commands with highlighting
  const eventCommands: Command[] = filteredEvents.map(({ event, match }) => {
    const titleMatch = fuzzySearch(query, event.title);
    return {
      id: `event-${event.id}`,
      label: `[EVENT] ${event.title}`,
      highlightedLabel: (
        <span>
          [EVENT] {getHighlightSegments(event.title, titleMatch.matches).map((segment, i) => (
            segment.highlighted ? (
              <span key={i} className="bg-primary text-primary-foreground font-bold">
                {segment.text}
              </span>
            ) : (
              <span key={i}>{segment.text}</span>
            )
          ))}
        </span>
      ),
      description: `${event.date.toLocaleDateString()} at ${event.startTime}`,
      action: () => {
        onEventSelect(event);
        onClose();
      }
    };
  });

  // Filter base commands based on fuzzy search
  const filteredCommands = query.length > 0
    ? baseCommands.map(cmd => {
        const labelMatch = fuzzySearch(query, cmd.label);
        const descMatch = fuzzySearch(query, cmd.description);
        const bestMatch = labelMatch.score > descMatch.score ? labelMatch : descMatch;
        return { 
          ...cmd, 
          match: bestMatch,
          highlightedLabel: (
            <span>{getHighlightSegments(cmd.label, labelMatch.matches).map((segment, i) => (
              segment.highlighted ? (
                <span key={i} className="bg-primary text-primary-foreground font-bold">
                  {segment.text}
                </span>
              ) : (
                <span key={i}>{segment.text}</span>
              )
            ))}</span>
          )
        };
      })
      .filter(cmd => cmd.match.score >= 0)
      .sort((a, b) => b.match.score - a.match.score)
    : baseCommands.map(cmd => ({ ...cmd, highlightedLabel: <span>{cmd.label}</span> }));

  const allCommands = [...filteredCommands, ...eventCommands];

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (e.ctrlKey) {
          // Ctrl+Down: Navigate command history forward
          if (historyIndex < commandHistory.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            setQuery(commandHistory[newIndex]);
          }
        } else {
          setSelectedIndex(prev => Math.min(prev + 1, allCommands.length - 1));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (e.ctrlKey) {
          // Ctrl+Up: Navigate command history backward
          if (historyIndex > 0 || (historyIndex === -1 && commandHistory.length > 0)) {
            const newIndex = historyIndex === -1 ? commandHistory.length - 1 : historyIndex - 1;
            setHistoryIndex(newIndex);
            setQuery(commandHistory[newIndex]);
          }
        } else {
          setSelectedIndex(prev => Math.max(prev - 1, 0));
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (allCommands[selectedIndex]) {
          // Add to command history
          if (query && !commandHistory.includes(query)) {
            setCommandHistory(prev => [query, ...prev.slice(0, 9)]); // Keep last 10 commands
          }
          allCommands[selectedIndex].action();
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-start justify-center z-50 p-4">
      <div className="bg-card border border-border w-full max-w-2xl mt-20 spacing-mathematical">
        {/* Search Input */}
        <div className="border-b border-border">
          <div className="flex items-center" style={{padding: 'var(--space-lg)'}}>
            <div className="text-muted-foreground font-mono font-bold mr-3">[CMD]</div>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-foreground font-mono font-bold outline-none placeholder-muted-foreground"
              placeholder="Type a command or search events..."
            />
            <div className="text-muted-foreground font-mono text-xs">[ESC]</div>
          </div>
        </div>

        {/* Commands List */}
        <div className="max-h-96 overflow-y-auto">
          {allCommands.length === 0 ? (
            <div className="text-center text-muted-foreground font-mono" style={{padding: 'var(--space-xl)'}}>
              [NO_RESULTS]
            </div>
          ) : (
            allCommands.map((command, index) => (
              <div
                key={command.id}
                className={`cursor-pointer transition-all duration-150 border-b border-border last:border-b-0 ${
                  index === selectedIndex
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
                style={{padding: 'var(--space-md) var(--space-lg)'}}
                onClick={() => command.action()}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-mono font-bold text-sm">
                      {command.highlightedLabel || command.label}
                    </div>
                    <div className="text-xs opacity-75 font-mono">
                      {command.description}
                    </div>
                  </div>
                  {command.shortcut && (
                    <div className="text-xs font-mono opacity-60">
                      [{command.shortcut}]
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Enhanced Footer */}
        <div className="border-t border-border text-xs text-muted-foreground font-mono" style={{padding: 'var(--space-sm) var(--space-lg)'}}>
          <div className="flex items-center justify-between">
            <div>[↑↓] NAVIGATE</div>
            <div>[CTRL+↑↓] HISTORY</div>
            <div>[ENTER] SELECT</div>
            <div>[ESC] CLOSE</div>
          </div>
        </div>
      </div>
    </div>
  );
}