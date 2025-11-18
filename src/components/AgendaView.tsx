'use client';

import { useState, useMemo } from 'react';
import { CalendarEvent, DEFAULT_CATEGORIES } from '@/types/event';
import EventCard from './EventCard';

interface AgendaViewProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onEventDelete?: (eventId: string) => void;
  onEventDuplicate?: (event: CalendarEvent) => void;
}

export default function AgendaView({ events, onEventClick, onEventDelete, onEventDuplicate }: AgendaViewProps) {
  const [daysToShow, setDaysToShow] = useState(7);

  // Group events by date
  const groupedEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDate = new Date(today);
    endDate.setDate(today.getDate() + daysToShow);

    const groups: { date: Date; events: CalendarEvent[] }[] = [];

    for (let d = new Date(today); d < endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = new Date(d);
      const dayEvents = events
        .filter(event => {
          const eventDate = new Date(event.date);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate.getTime() === dateKey.getTime();
        })
        .sort((a, b) => {
          const aTime = parseInt(a.startTime.replace(':', ''));
          const bTime = parseInt(b.startTime.replace(':', ''));
          return aTime - bTime;
        });

      groups.push({ date: new Date(dateKey), events: dayEvents });
    }

    return groups;
  }, [events, daysToShow]);

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <div className="bg-card shadow-2xl border border-border spacing-mathematical">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-3xl font-bold text-foreground font-mono uppercase tracking-wider">
            [AGENDA_VIEW]
          </h2>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base font-mono uppercase tracking-wide">
            Next {daysToShow} days
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setDaysToShow(7)}
            className={`brutalist-button text-sm ${daysToShow === 7 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
            style={{ padding: 'var(--space-sm) var(--space-md)' }}
          >
            7 Days
          </button>
          <button
            onClick={() => setDaysToShow(14)}
            className={`brutalist-button text-sm ${daysToShow === 14 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
            style={{ padding: 'var(--space-sm) var(--space-md)' }}
          >
            14 Days
          </button>
          <button
            onClick={() => setDaysToShow(30)}
            className={`brutalist-button text-sm ${daysToShow === 30 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
            style={{ padding: 'var(--space-sm) var(--space-md)' }}
          >
            30 Days
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {groupedEvents.map(({ date, events: dayEvents }) => (
          <div key={date.toISOString()} className={`${isPast(date) ? 'opacity-60' : ''}`}>
            <div className={`sticky top-0 z-10 flex items-center gap-3 mb-3 pb-2 border-b-2 ${
              isToday(date) ? 'border-primary bg-primary/10' : 'border-border bg-card'
            } backdrop-blur-sm`} style={{ padding: 'var(--space-sm) 0' }}>
              <div className="flex-1">
                <div className="font-bold text-lg font-mono uppercase tracking-wider">
                  {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </div>
                {isToday(date) && (
                  <div className="text-xs text-primary font-mono">[TODAY]</div>
                )}
              </div>
              <div className="text-sm text-muted-foreground font-mono">
                {dayEvents.length} {dayEvents.length === 1 ? 'event' : 'events'}
              </div>
            </div>

            {dayEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground font-mono text-sm">
                [NO_EVENTS_SCHEDULED]
              </div>
            ) : (
              <div className="space-y-3">
                {dayEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                    variant="list"
                    onClick={onEventClick}
                    onEdit={onEventClick}
                    onDelete={onEventDelete}
                    onDuplicate={onEventDuplicate}
                    className="agenda-event-item"
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
