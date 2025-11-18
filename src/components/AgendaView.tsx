'use client';

import { useState, useMemo } from 'react';
import { CalendarEvent, DEFAULT_CATEGORIES } from '@/types/event';

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
              <div className="space-y-2">
                {dayEvents.map(event => {
                  const category = DEFAULT_CATEGORIES.find(cat => cat.id === event.categoryId) || DEFAULT_CATEGORIES[0];
                  const duration = (() => {
                    const [startH, startM] = event.startTime.split(':').map(Number);
                    const [endH, endM] = event.endTime.split(':').map(Number);
                    const minutes = (endH * 60 + endM) - (startH * 60 + startM);
                    const hours = Math.floor(minutes / 60);
                    const mins = minutes % 60;
                    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
                  })();

                  return (
                    <div
                      key={event.id}
                      onClick={() => onEventClick?.(event)}
                      className={`group cursor-pointer border-2 transition-all duration-200 hover:transform hover:translate-x-1 ${category.color} spacing-mathematical`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 text-center w-20">
                          <div className="font-bold text-lg font-mono">{event.startTime}</div>
                          <div className="text-xs text-muted-foreground font-mono">{duration}</div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-mono font-bold">{category.icon}</span>
                            <span className="font-bold font-mono text-lg">{event.title}</span>
                            {event.isRecurring && (
                              <span className="text-xs font-mono opacity-75" title="Recurring">[R]</span>
                            )}
                            {event.priority === 'high' && (
                              <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 font-mono">!</span>
                            )}
                            {event.status === 'tentative' && (
                              <span className="text-xs opacity-75 font-mono" title="Tentative">[?]</span>
                            )}
                            {event.status === 'cancelled' && (
                              <span className="text-xs line-through opacity-60 font-mono">[X]</span>
                            )}
                          </div>

                          {event.description && (
                            <div className="text-sm opacity-80 mb-2 font-mono line-clamp-2">
                              {event.description}
                            </div>
                          )}

                          <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
                            <span>{event.startTime} - {event.endTime}</span>
                            {event.location && (
                              <span className="flex items-center gap-1">
                                📍 {event.location}
                              </span>
                            )}
                            {event.reminderMinutes && (
                              <span className="flex items-center gap-1">
                                🔔 {event.reminderMinutes}min
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                          {onEventDuplicate && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onEventDuplicate(event);
                              }}
                              className="p-2 hover:bg-secondary transition-colors"
                              title="Duplicate"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          )}
                          {onEventDelete && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm(`Delete "${event.title}"?`)) {
                                  onEventDelete(event.id);
                                }
                              }}
                              className="p-2 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
