'use client';

import { useState, useRef, useEffect } from 'react';
import { parseNaturalLanguage } from '@/utils/naturalLanguage';
import { CalendarEvent } from '@/types/event';
import VoiceInput from './VoiceInput';

interface QuickAddProps {
  onAddEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  onOpenFullModal: (prefill?: Partial<Omit<CalendarEvent, 'id'>>) => void;
}

export default function QuickAdd({ onAddEvent, onOpenFullModal }: QuickAddProps) {
  const [input, setInput] = useState('');
  const [preview, setPreview] = useState<Partial<CalendarEvent> | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
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
      description: preview.description || '',
      priority: preview.priority,
      location: preview.location,
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

  const handleVoiceTranscript = (transcript: string) => {
    setInput(transcript);
    setVoiceError(null);
    setIsExpanded(true);
    inputRef.current?.focus();
  };

  const handleVoiceError = (error: string) => {
    setVoiceError(error);
    setTimeout(() => setVoiceError(null), 5000); // Clear error after 5 seconds
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
              placeholder="Quick add: 'Meeting tomorrow at 3pm' or speak it 🎤"
              className="w-full bg-card text-foreground border-2 border-border px-4 py-3 pr-32 font-mono text-sm focus:border-primary focus:outline-none transition-colors"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <VoiceInput
                onTranscript={handleVoiceTranscript}
                onError={handleVoiceError}
              />
              <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-mono bg-muted text-muted-foreground border border-border">
                Ctrl+Q
              </kbd>
            </div>
          </div>

          {/* Voice Error Display */}
          {voiceError && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-destructive/10 border-2 border-destructive px-4 py-2 z-50 animate-in slide-in-from-top-2">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-destructive flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm font-mono text-destructive">{voiceError}</span>
              </div>
            </div>
          )}

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
                    {preview.location && <div>📍 {preview.location}</div>}
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
                  <div>• &quot;Team standup tomorrow at 9am for 15 minutes&quot;</div>
                  <div>• &quot;Lunch from 12pm to 1:30pm&quot;</div>
                  <div>• &quot;Doctor appointment December 25 at 2pm&quot;</div>
                  <div>• &quot;Gym in 3 days at 6am for 2 hours&quot;</div>
                  <div>• &quot;Coffee @ Starbucks next Monday at noon&quot;</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
