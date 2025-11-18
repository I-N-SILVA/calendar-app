import { CalendarEvent } from '@/types/event';

export interface ConflictGroup {
  events: CalendarEvent[];
  columns: number;
  positions: Map<string, { column: number; span: number }>;
}

/**
 * Check if two events overlap in time
 */
export function eventsOverlap(event1: CalendarEvent, event2: CalendarEvent): boolean {
  if (event1.date.toDateString() !== event2.date.toDateString()) {
    return false;
  }

  const [start1H, start1M] = event1.startTime.split(':').map(Number);
  const [end1H, end1M] = event1.endTime.split(':').map(Number);
  const [start2H, start2M] = event2.startTime.split(':').map(Number);
  const [end2H, end2M] = event2.endTime.split(':').map(Number);

  const start1 = start1H * 60 + start1M;
  const end1 = end1H * 60 + end1M;
  const start2 = start2H * 60 + start2M;
  const end2 = end2H * 60 + end2M;

  return start1 < end2 && start2 < end1;
}

/**
 * Group overlapping events and calculate their layout positions
 */
export function groupConflictingEvents(events: CalendarEvent[]): ConflictGroup[] {
  if (events.length === 0) return [];

  // Sort events by start time, then by duration (longer events first)
  const sortedEvents = [...events].sort((a, b) => {
    const aStart = parseInt(a.startTime.replace(':', ''));
    const bStart = parseInt(b.startTime.replace(':', ''));
    if (aStart !== bStart) return aStart - bStart;

    // If start times are equal, longer events come first
    const aDuration = parseInt(a.endTime.replace(':', '')) - aStart;
    const bDuration = parseInt(b.endTime.replace(':', '')) - bStart;
    return bDuration - aDuration;
  });

  const groups: ConflictGroup[] = [];
  const processed = new Set<string>();

  for (const event of sortedEvents) {
    if (processed.has(event.id)) continue;

    // Find all events that overlap with this one
    const conflictingEvents = [event];
    const queue = [event];
    processed.add(event.id);

    while (queue.length > 0) {
      const current = queue.shift()!;

      for (const other of sortedEvents) {
        if (processed.has(other.id)) continue;

        if (eventsOverlap(current, other)) {
          conflictingEvents.push(other);
          queue.push(other);
          processed.add(other.id);
        }
      }
    }

    // Calculate layout positions for this conflict group
    const positions = calculateEventPositions(conflictingEvents);
    const columns = Math.max(...Array.from(positions.values()).map(p => p.column + p.span));

    groups.push({
      events: conflictingEvents,
      columns,
      positions,
    });
  }

  return groups;
}

/**
 * Calculate column positions for overlapping events
 */
function calculateEventPositions(events: CalendarEvent[]): Map<string, { column: number; span: number }> {
  const positions = new Map<string, { column: number; span: number }>();

  // Sort by start time, then by end time
  const sorted = [...events].sort((a, b) => {
    const aStart = parseInt(a.startTime.replace(':', ''));
    const bStart = parseInt(b.startTime.replace(':', ''));
    if (aStart !== bStart) return aStart - bStart;

    const aEnd = parseInt(a.endTime.replace(':', ''));
    const bEnd = parseInt(b.endTime.replace(':', ''));
    return aEnd - bEnd;
  });

  // Track which columns are occupied at each time point
  const columnOccupancy: Array<{ event: CalendarEvent; end: number }> = [];

  for (const event of sorted) {
    const start = parseInt(event.startTime.replace(':', ''));
    const end = parseInt(event.endTime.replace(':', ''));

    // Find the first available column
    let column = 0;
    const occupiedColumns = new Set<number>();

    // Check which columns are occupied by events that overlap with this one
    for (let i = 0; i < columnOccupancy.length; i++) {
      const occupied = columnOccupancy[i];
      if (occupied.end > start) {
        occupiedColumns.add(i);
      } else {
        // This column is free, remove it from occupancy
        columnOccupancy[i] = { event, end };
        column = i;
        break;
      }
    }

    // If all columns are occupied, create a new one
    if (occupiedColumns.size === columnOccupancy.length) {
      column = columnOccupancy.length;
      columnOccupancy.push({ event, end });
    }

    // Calculate span (how many columns this event can expand into)
    let span = 1;
    for (let i = column + 1; i < columnOccupancy.length + 1; i++) {
      // Check if this column is free for the entire duration of the event
      let isFree = true;
      for (const occupied of columnOccupancy) {
        if (columnOccupancy.indexOf(occupied) === i && occupied.end > start) {
          isFree = false;
          break;
        }
      }
      if (isFree) {
        span++;
      } else {
        break;
      }
    }

    positions.set(event.id, { column, span: 1 }); // Keep span as 1 for now
  }

  return positions;
}

/**
 * Check if an event has conflicts at a specific hour
 */
export function hasConflictsAtHour(event: CalendarEvent, hour: number, allEvents: CalendarEvent[]): boolean {
  const [startH] = event.startTime.split(':').map(Number);
  const [endH, endM] = event.endTime.split(':').map(Number);
  const actualEndH = endM > 0 ? endH + 1 : endH;

  // Check if event is active at this hour
  if (hour < startH || hour >= actualEndH) {
    return false;
  }

  // Check if any other event overlaps at this hour
  return allEvents.some(other => {
    if (other.id === event.id) return false;
    if (other.date.toDateString() !== event.date.toDateString()) return false;

    const [otherStartH] = other.startTime.split(':').map(Number);
    const [otherEndH, otherEndM] = other.endTime.split(':').map(Number);
    const otherActualEndH = otherEndM > 0 ? otherEndH + 1 : otherEndH;

    return hour >= otherStartH && hour < otherActualEndH && eventsOverlap(event, other);
  });
}

/**
 * Get events for a specific day sorted by start time
 */
export function getEventsForDay(date: Date, events: CalendarEvent[]): CalendarEvent[] {
  return events
    .filter(event => event.date.toDateString() === date.toDateString())
    .sort((a, b) => {
      const aStart = parseInt(a.startTime.replace(':', ''));
      const bStart = parseInt(b.startTime.replace(':', ''));
      return aStart - bStart;
    });
}
