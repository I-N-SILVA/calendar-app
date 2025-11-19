import { CalendarEvent } from '@/types/event';

export function exportToICalendar(events: CalendarEvent[], filename: string = 'calendar.ics') {
  const icsContent = generateICS(events);
  downloadFile(icsContent, filename, 'text/calendar');
}

export function exportToJSON(events: CalendarEvent[], filename: string = 'calendar.json') {
  const jsonContent = JSON.stringify(events, null, 2);
  downloadFile(jsonContent, filename, 'application/json');
}

function generateICS(events: CalendarEvent[]): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Calendar App//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  events.forEach(event => {
    if (event.status === 'cancelled') return;

    const eventDate = new Date(event.date);
    const [startHour, startMin] = event.startTime.split(':').map(Number);
    const [endHour, endMin] = event.endTime.split(':').map(Number);

    const startDateTime = new Date(eventDate);
    startDateTime.setHours(startHour, startMin, 0, 0);

    const endDateTime = new Date(eventDate);
    endDateTime.setHours(endHour, endMin, 0, 0);

    const uid = `${event.id}@calendar-app`;
    const created = new Date();

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${formatICSDate(created)}`);
    lines.push(`DTSTART:${formatICSDate(startDateTime)}`);
    lines.push(`DTEND:${formatICSDate(endDateTime)}`);
    lines.push(`SUMMARY:${escapeICS(event.title)}`);

    if (event.description) {
      lines.push(`DESCRIPTION:${escapeICS(event.description)}`);
    }

    if (event.location) {
      lines.push(`LOCATION:${escapeICS(event.location)}`);
    }

    // Add priority (1=high, 5=medium, 9=low in iCal)
    const icalPriority = event.priority === 'high' ? 1 : event.priority === 'low' ? 9 : 5;
    lines.push(`PRIORITY:${icalPriority}`);

    // Add status
    const icalStatus = event.status === 'tentative' ? 'TENTATIVE' : 'CONFIRMED';
    lines.push(`STATUS:${icalStatus}`);

    // Add category
    lines.push(`CATEGORIES:${event.categoryId.toUpperCase()}`);

    // Add alarm/reminder
    if (event.reminderMinutes) {
      lines.push('BEGIN:VALARM');
      lines.push('ACTION:DISPLAY');
      lines.push(`DESCRIPTION:Reminder: ${escapeICS(event.title)}`);
      lines.push(`TRIGGER:-PT${event.reminderMinutes}M`);
      lines.push('END:VALARM');
    }

    // Add recurrence if applicable
    if (event.isRecurring && event.recurrence) {
      const rrule = generateRRule(event.recurrence);
      if (rrule) {
        lines.push(`RRULE:${rrule}`);
      }
    }

    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}

function formatICSDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function generateRRule(recurrence: any): string {
  const parts = [];

  // Frequency
  parts.push(`FREQ=${recurrence.frequency.toUpperCase()}`);

  // Interval
  if (recurrence.interval > 1) {
    parts.push(`INTERVAL=${recurrence.interval}`);
  }

  // End type
  if (recurrence.endType === 'after' && recurrence.endValue) {
    parts.push(`COUNT=${recurrence.endValue}`);
  } else if (recurrence.endType === 'until' && recurrence.endValue) {
    const untilDate = new Date(recurrence.endValue);
    parts.push(`UNTIL=${formatICSDate(untilDate)}`);
  }

  // Days of week
  if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
    const days = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    const byDay = recurrence.daysOfWeek.map((d: number) => days[d]).join(',');
    parts.push(`BYDAY=${byDay}`);
  }

  // Day of month
  if (recurrence.dayOfMonth) {
    parts.push(`BYMONTHDAY=${recurrence.dayOfMonth}`);
  }

  return parts.join(';');
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importFromJSON(file: File): Promise<CalendarEvent[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const events = JSON.parse(content).map((event: any) => ({
          ...event,
          date: new Date(event.date),
        }));
        resolve(events);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}
