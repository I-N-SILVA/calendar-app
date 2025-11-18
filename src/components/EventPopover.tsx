'use client';

import { CalendarEvent } from '@/types/event';
import { useState, useRef, useEffect } from 'react';
import EventCard from './EventCard';

interface EventPopoverProps {
  events: CalendarEvent[];
  date: Date;
  trigger: React.ReactNode;
  onEventClick?: (event: CalendarEvent) => void;
  onEventDelete?: (eventId: string) => void;
  onEventDuplicate?: (event: CalendarEvent) => void;
}

export default function EventPopover({
  events,
  date,
  trigger,
  onEventClick,
  onEventDelete,
  onEventDuplicate,
}: EventPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // Default position: below the trigger
      let top = rect.bottom + 8;
      let left = rect.left;

      // Adjust if popover would go off-screen vertically
      const popoverHeight = 400; // Estimated max height
      if (top + popoverHeight > viewportHeight) {
        // Position above the trigger instead
        top = rect.top - popoverHeight - 8;
      }

      // Adjust if popover would go off-screen horizontally
      const popoverWidth = 320;
      if (left + popoverWidth > viewportWidth) {
        left = viewportWidth - popoverWidth - 16;
      }

      setPosition({ top, left });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  return (
    <>
      {/* Trigger */}
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsOpen(true)}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        {trigger}
      </div>

      {/* Popover */}
      {isOpen && position && (
        <div
          ref={popoverRef}
          className="fixed z-50 animate-in fade-in-0 zoom-in-95"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: '320px',
            maxHeight: '400px',
          }}
          onMouseLeave={() => setIsOpen(false)}
        >
          <div
            className="bg-card border-2 border-border overflow-hidden"
            style={{
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            {/* Header */}
            <div
              className="bg-muted border-b-2 border-border"
              style={{ padding: 'var(--space-3)' }}
            >
              <div className="font-bold text-sm font-mono text-foreground">
                {date.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })}
              </div>
              <div className="text-xs text-muted-foreground font-mono mt-1">
                {events.length} {events.length === 1 ? 'event' : 'events'}
              </div>
            </div>

            {/* Events List */}
            <div
              className="overflow-y-auto"
              style={{
                maxHeight: '320px',
                padding: 'var(--space-2)',
              }}
            >
              <div className="space-y-2">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    variant="compact"
                    onClick={(e) => {
                      setIsOpen(false);
                      onEventClick?.(e);
                    }}
                    onEdit={(e) => {
                      setIsOpen(false);
                      onEventClick?.(e);
                    }}
                    onDelete={onEventDelete}
                    onDuplicate={onEventDuplicate}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
