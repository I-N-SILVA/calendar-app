import { CalendarEvent, EventPriority } from '@/types/event';

interface ParsedEvent {
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  priority?: EventPriority;
  categoryId: string;
}

export function parseNaturalLanguage(input: string): Partial<ParsedEvent> | null {
  const result: Partial<ParsedEvent> = {
    categoryId: 'work',
  };

  let text = input.toLowerCase().trim();

  // Extract priority
  if (text.includes('high priority') || text.includes('urgent') || text.includes('important')) {
    result.priority = 'high';
    text = text.replace(/high priority|urgent|important/gi, '').trim();
  } else if (text.includes('low priority')) {
    result.priority = 'low';
    text = text.replace(/low priority/gi, '').trim();
  } else {
    result.priority = 'medium';
  }

  // Extract date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (text.includes('tomorrow')) {
    result.date = new Date(today);
    result.date.setDate(today.getDate() + 1);
    text = text.replace(/tomorrow/gi, '').trim();
  } else if (text.includes('today')) {
    result.date = new Date(today);
    text = text.replace(/today/gi, '').trim();
  } else if (text.match(/next (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i)) {
    const match = text.match(/next (monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
    if (match) {
      const dayName = match[1];
      result.date = getNextDayOfWeek(dayName);
      text = text.replace(match[0], '').trim();
    }
  } else if (text.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i)) {
    const match = text.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
    if (match) {
      const dayName = match[1];
      result.date = getNextDayOfWeek(dayName);
      text = text.replace(match[0], '').trim();
    }
  } else {
    result.date = new Date(today);
  }

  // Extract time
  const timeMatch = text.match(/at (\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (timeMatch) {
    let hours = parseInt(timeMatch[1]);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
    const meridiem = timeMatch[3]?.toLowerCase();

    if (meridiem === 'pm' && hours !== 12) hours += 12;
    if (meridiem === 'am' && hours === 12) hours = 0;

    result.startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    result.endTime = `${(hours + 1).toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    text = text.replace(timeMatch[0], '').trim();
  } else {
    // Default to 9 AM
    result.startTime = '09:00';
    result.endTime = '10:00';
  }

  // Extract category keywords
  if (text.match(/meeting|work|office|call|conference/i)) {
    result.categoryId = 'work';
  } else if (text.match(/doctor|gym|exercise|health|workout/i)) {
    result.categoryId = 'health';
  } else if (text.match(/dinner|lunch|coffee|party|hangout/i)) {
    result.categoryId = 'social';
  } else if (text.match(/class|study|course|lecture|learn/i)) {
    result.categoryId = 'education';
  } else if (text.match(/flight|trip|travel|vacation/i)) {
    result.categoryId = 'travel';
  } else if (text.match(/personal|errands|shopping/i)) {
    result.categoryId = 'personal';
  }

  // Remove common words and use the rest as title
  text = text.replace(/\bat\b|\bon\b|\bfor\b|\bwith\b/gi, '').trim();

  if (text.length > 0) {
    result.title = text.charAt(0).toUpperCase() + text.slice(1);
  } else {
    result.title = 'New Event';
  }

  return result as ParsedEvent;
}

function getNextDayOfWeek(dayName: string): Date {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const targetDay = days.indexOf(dayName.toLowerCase());

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentDay = today.getDay();

  let daysUntilTarget = targetDay - currentDay;
  if (daysUntilTarget <= 0) {
    daysUntilTarget += 7;
  }

  const result = new Date(today);
  result.setDate(today.getDate() + daysUntilTarget);
  return result;
}

// Examples:
// "Meeting tomorrow at 3pm" -> Meeting, tomorrow, 15:00-16:00
// "Doctor appointment next Monday at 10am" -> Doctor appointment, next Monday, 10:00-11:00
// "High priority call at 2:30pm" -> Call, today, 14:30-15:30, high priority
// "Gym workout at 6am tomorrow" -> Gym workout, tomorrow, 06:00-07:00, health category
