import { CalendarEvent } from '@/types/event';

export interface EventConflict {
  event1: CalendarEvent;
  event2: CalendarEvent;
  overlapMinutes: number;
}

// Check if two time ranges overlap
function doTimesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const [h1Start, m1Start] = start1.split(':').map(Number);
  const [h1End, m1End] = end1.split(':').map(Number);
  const [h2Start, m2Start] = start2.split(':').map(Number);
  const [h2End, m2End] = end2.split(':').map(Number);

  const start1Minutes = h1Start * 60 + m1Start;
  const end1Minutes = h1End * 60 + m1End;
  const start2Minutes = h2Start * 60 + m2Start;
  const end2Minutes = h2End * 60 + m2End;

  return start1Minutes < end2Minutes && start2Minutes < end1Minutes;
}

// Calculate overlap in minutes
function calculateOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): number {
  const [h1Start, m1Start] = start1.split(':').map(Number);
  const [h1End, m1End] = end1.split(':').map(Number);
  const [h2Start, m2Start] = start2.split(':').map(Number);
  const [h2End, m2End] = end2.split(':').map(Number);

  const start1Minutes = h1Start * 60 + m1Start;
  const end1Minutes = h1End * 60 + m1End;
  const start2Minutes = h2Start * 60 + m2Start;
  const end2Minutes = h2End * 60 + m2End;

  const overlapStart = Math.max(start1Minutes, start2Minutes);
  const overlapEnd = Math.min(end1Minutes, end2Minutes);

  return Math.max(0, overlapEnd - overlapStart);
}

// Find conflicts for a specific event
export function findConflicts(
  event: CalendarEvent,
  allEvents: CalendarEvent[]
): EventConflict[] {
  const conflicts: EventConflict[] = [];

  allEvents.forEach(otherEvent => {
    // Skip same event
    if (event.id === otherEvent.id) return;

    // Check if events are on same day
    if (event.date.toDateString() !== otherEvent.date.toDateString()) return;

    // Check for time overlap
    if (doTimesOverlap(event.startTime, event.endTime, otherEvent.startTime, otherEvent.endTime)) {
      const overlapMinutes = calculateOverlap(
        event.startTime,
        event.endTime,
        otherEvent.startTime,
        otherEvent.endTime
      );

      conflicts.push({
        event1: event,
        event2: otherEvent,
        overlapMinutes,
      });
    }
  });

  return conflicts;
}

// Check if event has conflicts
export function hasConflicts(event: CalendarEvent, allEvents: CalendarEvent[]): boolean {
  return findConflicts(event, allEvents).length > 0;
}

// Get conflict warning message
export function getConflictMessage(conflicts: EventConflict[]): string {
  if (conflicts.length === 0) return '';

  const conflictTitles = conflicts.map(c => c.event2.title).join(', ');
  return `This event conflicts with: ${conflictTitles}`;
}
