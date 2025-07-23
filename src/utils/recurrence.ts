import { CalendarEvent, RecurrenceRule } from '@/types/event';

export function generateRecurringEvents(
  baseEvent: CalendarEvent,
  startDate: Date,
  endDate: Date
): CalendarEvent[] {
  if (!baseEvent.recurrence || !baseEvent.isRecurring) {
    return [baseEvent];
  }

  const events: CalendarEvent[] = [];
  const rule = baseEvent.recurrence;
  let currentDate = new Date(baseEvent.date);
  let count = 0;
  const maxOccurrences = 1000; // Safety limit

  while (currentDate <= endDate && count < maxOccurrences) {
    // Check if we should stop based on end conditions
    if (rule.endType === 'after' && typeof rule.endValue === 'number' && count >= rule.endValue) {
      break;
    }
    if (rule.endType === 'until' && rule.endValue instanceof Date && currentDate > rule.endValue) {
      break;
    }

    // Only add events within our view range
    if (currentDate >= startDate && currentDate <= endDate) {
      const eventInstance: CalendarEvent = {
        ...baseEvent,
        id: `${baseEvent.id}_${currentDate.getTime()}`,
        date: new Date(currentDate),
        originalEventId: baseEvent.id,
        instanceDate: new Date(currentDate)
      };
      events.push(eventInstance);
    }

    // Calculate next occurrence
    currentDate = getNextOccurrence(currentDate, rule);
    count++;
  }

  return events;
}

function getNextOccurrence(currentDate: Date, rule: RecurrenceRule): Date {
  const nextDate = new Date(currentDate);

  switch (rule.frequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + rule.interval);
      break;

    case 'weekly':
      if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
        // Find next day of week in the pattern
        const currentDay = nextDate.getDay();
        const sortedDays = [...rule.daysOfWeek].sort((a, b) => a - b);
        
        let nextDay = sortedDays.find(day => day > currentDay);
        if (!nextDay) {
          // Move to next week and use first day
          nextDay = sortedDays[0];
          nextDate.setDate(nextDate.getDate() + (7 * rule.interval));
        }
        
        const daysToAdd = nextDay - currentDay;
        nextDate.setDate(nextDate.getDate() + daysToAdd);
      } else {
        nextDate.setDate(nextDate.getDate() + (7 * rule.interval));
      }
      break;

    case 'monthly':
      if (rule.dayOfMonth) {
        nextDate.setMonth(nextDate.getMonth() + rule.interval);
        nextDate.setDate(rule.dayOfMonth);
        
        // Handle months with fewer days
        if (nextDate.getDate() !== rule.dayOfMonth) {
          nextDate.setDate(0); // Go to last day of previous month
        }
      } else {
        nextDate.setMonth(nextDate.getMonth() + rule.interval);
      }
      break;

    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + rule.interval);
      break;
  }

  return nextDate;
}

export function getRecurrenceDescription(rule: RecurrenceRule): string {
  const { frequency, interval, endType, endValue, daysOfWeek } = rule;
  
  let description = '';
  
  // Frequency description
  if (interval === 1) {
    switch (frequency) {
      case 'daily': description = 'Daily'; break;
      case 'weekly': description = 'Weekly'; break;
      case 'monthly': description = 'Monthly'; break;
      case 'yearly': description = 'Yearly'; break;
    }
  } else {
    switch (frequency) {
      case 'daily': description = `Every ${interval} days`; break;
      case 'weekly': description = `Every ${interval} weeks`; break;
      case 'monthly': description = `Every ${interval} months`; break;
      case 'yearly': description = `Every ${interval} years`; break;
    }
  }

  // Days of week for weekly recurrence
  if (frequency === 'weekly' && daysOfWeek && daysOfWeek.length > 0) {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const selectedDays = daysOfWeek.map(day => dayNames[day]).join(', ');
    description += ` on ${selectedDays}`;
  }

  // End condition
  switch (endType) {
    case 'after':
      if (endValue) {
        description += `, ${endValue} times`;
      }
      break;
    case 'until':
      if (endValue instanceof Date) {
        description += `, until ${endValue.toLocaleDateString()}`;
      }
      break;
    case 'never':
      break;
  }

  return description;
}

export function isEventInRecurrenceSeries(event: CalendarEvent, seriesId: string): boolean {
  return event.originalEventId === seriesId || event.id === seriesId;
}