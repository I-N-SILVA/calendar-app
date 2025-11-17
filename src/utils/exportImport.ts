import { CalendarEvent } from '@/types/event';

// Export to JSON
export function exportToJSON(events: CalendarEvent[]): string {
  return JSON.stringify(events, null, 2);
}

// Export to iCal format
export function exportToICS(events: CalendarEvent[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Calendar App//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  events.forEach(event => {
    const startDateTime = new Date(event.date);
    const [startHour, startMin] = event.startTime.split(':').map(Number);
    startDateTime.setHours(startHour, startMin, 0, 0);

    const endDateTime = new Date(event.date);
    const [endHour, endMin] = event.endTime.split(':').map(Number);
    endDateTime.setHours(endHour, endMin, 0, 0);

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${event.id}@calendar-app`);
    lines.push(`DTSTAMP:${formatDate(new Date())}`);
    lines.push(`DTSTART:${formatDate(startDateTime)}`);
    lines.push(`DTEND:${formatDate(endDateTime)}`);
    lines.push(`SUMMARY:${event.title}`);

    if (event.description) {
      lines.push(`DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`);
    }

    lines.push(`CATEGORIES:${event.categoryId}`);

    if (event.isRecurring && event.recurrence) {
      const { frequency, interval, endType, endValue, daysOfWeek } = event.recurrence;
      let rrule = `FREQ=${frequency.toUpperCase()};INTERVAL=${interval}`;

      if (endType === 'after' && typeof endValue === 'number') {
        rrule += `;COUNT=${endValue}`;
      } else if (endType === 'until' && endValue instanceof Date) {
        rrule += `;UNTIL=${formatDate(endValue)}`;
      }

      if (frequency === 'weekly' && daysOfWeek && daysOfWeek.length > 0) {
        const dayNames = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
        const byDay = daysOfWeek.map(d => dayNames[d]).join(',');
        rrule += `;BYDAY=${byDay}`;
      }

      lines.push(`RRULE:${rrule}`);
    }

    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

// Import from JSON
export function importFromJSON(jsonString: string): CalendarEvent[] {
  try {
    const parsed = JSON.parse(jsonString);
    const events = Array.isArray(parsed) ? parsed : [parsed];

    return events.map((event: any) => ({
      ...event,
      date: new Date(event.date),
      recurrence: event.recurrence && event.recurrence.endValue instanceof Date
        ? { ...event.recurrence, endValue: new Date(event.recurrence.endValue) }
        : event.recurrence,
    }));
  } catch (error) {
    throw new Error('Invalid JSON format');
  }
}

// Download file helper
export function downloadFile(content: string, filename: string, mimeType: string) {
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

// Upload file helper
export function uploadFile(accept: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error('No file selected'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    };

    input.click();
  });
}
