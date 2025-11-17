import { CalendarEvent } from '@/types/event';

export interface EventConflict {
  event: CalendarEvent;
  conflictsWith: CalendarEvent[];
}

export function detectConflicts(
  newEvent: Omit<CalendarEvent, 'id'>,
  existingEvents: CalendarEvent[],
  excludeEventId?: string
): CalendarEvent[] {
  const conflicts: CalendarEvent[] = [];

  const newStart = parseTime(newEvent.startTime);
  const newEnd = parseTime(newEvent.endTime);
  const newDate = newEvent.date.toDateString();

  existingEvents.forEach(event => {
    // Skip if it's the same event being edited
    if (excludeEventId && event.id === excludeEventId) return;

    // Skip cancelled events
    if (event.status === 'cancelled') return;

    // Check if same day
    if (event.date.toDateString() !== newDate) return;

    const eventStart = parseTime(event.startTime);
    const eventEnd = parseTime(event.endTime);

    // Check for overlap
    if (
      (newStart >= eventStart && newStart < eventEnd) ||
      (newEnd > eventStart && newEnd <= eventEnd) ||
      (newStart <= eventStart && newEnd >= eventEnd)
    ) {
      conflicts.push(event);
    }
  });

  return conflicts;
}

export function getAllConflicts(events: CalendarEvent[]): EventConflict[] {
  const conflictMap = new Map<string, CalendarEvent[]>();

  events.forEach((event, index) => {
    if (event.status === 'cancelled') return;

    const conflicts = detectConflicts(event, events.slice(index + 1), event.id);
    if (conflicts.length > 0) {
      conflictMap.set(event.id, conflicts);
    }
  });

  return Array.from(conflictMap.entries()).map(([eventId, conflictsWith]) => ({
    event: events.find(e => e.id === eventId)!,
    conflictsWith,
  }));
}

function parseTime(timeString: string): number {
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

export function formatConflictMessage(conflicts: CalendarEvent[]): string {
  if (conflicts.length === 0) return '';

  const conflictList = conflicts.map(e => `"${e.title}" (${e.startTime}-${e.endTime})`).join(', ');
  return `This event conflicts with: ${conflictList}`;
}
