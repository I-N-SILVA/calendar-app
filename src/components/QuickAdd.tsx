'use client';

import { useState, useRef, useEffect } from 'react';
import { parseNaturalLanguage } from '@/utils/naturalLanguage';
import { CalendarEvent } from '@/types/event';

interface QuickAddProps {
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onOpenFullModal: (prefill?: Partial<Omit<CalendarEvent, 'id'>>) => void;
}

export default function QuickAdd({ onAddEvent, onOpenFullModal }: QuickAddProps) {
  const [input, setInput] = useState('');
  const [preview, setPreview] = useState<Partial<CalendarEvent> | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Listen for Ctrl/Cmd + Q to focus quick add
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'q') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsExpanded(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (input.trim()) {
      const parsed = parseNaturalLanguage(input);
      if (parsed && parsed.title) {
        setPreview(parsed as Partial<CalendarEvent>);
      } else {
        setPreview(null);
      }
    } else {
      setPreview(null);
    }
  }, [input]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!preview || !preview.title) return;

    const event: Omit<CalendarEvent, 'id'> = {
      title: preview.title,
      date: preview.date || new Date(),
      startTime: preview.startTime || '09:00',
      endTime: preview.endTime || '10:00',
      categoryId: preview.categoryId || 'work',
      description: '',
      priority: preview.priority,
    };

    onAddEvent(event);
    setInput('');
    setPreview(null);
    setIsExpanded(false);
  };

  const handleExpand = () => {
    if (preview) {
      onOpenFullModal(preview);
      setInput('');
      setPreview(null);
      setIsExpanded(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className={`transition-all duration-200 ${isExpanded ? 'scale-100' : 'scale-100'}`}>
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              onBlur={() => setTimeout(() => setIsExpanded(false), 200)}
              placeholder="Quick add: 'Meeting tomorrow at 3pm' or 'Gym workout Monday at 6am'"
              className="w-full bg-card text-foreground border-2 border-border px-4 py-3 font-mono text-sm focus:border-primary focus:outline-none transition-colors"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-mono bg-muted text-muted-foreground border border-border">
                Ctrl+Q
              </kbd>
              <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          </div>

          {/* Preview */}
          {isExpanded && preview && preview.title && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-card border-2 border-primary shadow-lg z-50 spacing-mathematical animate-in slide-in-from-top-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-foreground font-mono">{preview.title}</span>
                    {preview.priority === 'high' && (
                      <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 font-mono">HIGH</span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground font-mono space-y-1">
                    <div>📅 {preview.date?.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</div>
                    <div>🕐 {preview.startTime} - {preview.endTime}</div>
                    <div>📁 {preview.categoryId?.toUpperCase()}</div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    type="submit"
                    className="brutalist-button bg-primary text-primary-foreground text-xs whitespace-nowrap"
                    style={{ padding: 'var(--space-sm) var(--space-md)' }}
                  >
                    Quick Add
                  </button>
                  <button
                    type="button"
                    onClick={handleExpand}
                    className="brutalist-button bg-secondary text-secondary-foreground text-xs whitespace-nowrap"
                    style={{ padding: 'var(--space-sm) var(--space-md)' }}
                  >
                    Edit Details
                  </button>
                </div>
              </div>

              {/* Examples */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="text-xs text-muted-foreground font-mono mb-2">[EXAMPLES]</div>
                <div className="text-xs space-y-1 font-mono opacity-70">
                  <div>• "Team standup tomorrow at 9am"</div>
                  <div>• "High priority client call Friday at 2pm"</div>
                  <div>• "Gym workout next Monday at 6am"</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
