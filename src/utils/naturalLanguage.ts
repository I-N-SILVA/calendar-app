import { EventPriority } from '@/types/event';

interface ParsedEvent {
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  priority?: EventPriority;
  categoryId: string;
  description?: string;
  location?: string;
}

/**
 * Enhanced natural language parser for calendar events
 * Supports multiple date/time formats, durations, locations, and more
 */
export function parseNaturalLanguage(input: string): Partial<ParsedEvent> | null {
  if (!input || input.trim().length === 0) return null;

  const result: Partial<ParsedEvent> = {
    categoryId: 'work',
    priority: 'medium',
  };

  let text = input.trim();
  const originalText = text;

  // Step 1: Extract quoted title (e.g., "Team Meeting" tomorrow)
  const quotedTitleMatch = text.match(/["']([^"']+)["']/);
  if (quotedTitleMatch) {
    result.title = quotedTitleMatch[1];
    text = text.replace(quotedTitleMatch[0], '').trim();
  }

  // Step 2: Extract location (e.g., "at Conference Room A", "@ Zoom")
  const locationMatch = text.match(/(?:at|@)\s+([A-Z][A-Za-z0-9\s]+?)(?:\s+(?:on|tomorrow|today|next|this|at|from|\d))/i);
  if (locationMatch) {
    result.location = locationMatch[1].trim();
    text = text.replace(locationMatch[0], locationMatch[0].replace(locationMatch[1], '').trim()).trim();
  }

  // Step 3: Extract priority
  if (text.match(/\b(high priority|urgent|important|critical|asap)\b/i)) {
    result.priority = 'high';
    text = text.replace(/\b(high priority|urgent|important|critical|asap)\b/gi, '').trim();
  } else if (text.match(/\b(low priority|optional|maybe)\b/i)) {
    result.priority = 'low';
    text = text.replace(/\b(low priority|optional|maybe)\b/gi, '').trim();
  }

  // Step 4: Extract date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Parse specific dates first
  const datePatterns = [
    // MM/DD or MM/DD/YYYY
    { pattern: /\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/, handler: (match: RegExpMatchArray) => {
      const month = parseInt(match[1]) - 1;
      const day = parseInt(match[2]);
      const year = match[3] ? (match[3].length === 2 ? 2000 + parseInt(match[3]) : parseInt(match[3])) : today.getFullYear();
      const date = new Date(year, month, day);
      return date;
    }},
    // Month Day (e.g., "December 25", "Dec 25")
    { pattern: /\b(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{1,2})(?:st|nd|rd|th)?\b/i, handler: (match: RegExpMatchArray) => {
      const months: {[key: string]: number} = {
        january: 0, jan: 0, february: 1, feb: 1, march: 2, mar: 2,
        april: 3, apr: 3, may: 4, june: 5, jun: 5, july: 6, jul: 6,
        august: 7, aug: 7, september: 8, sep: 8, october: 9, oct: 9,
        november: 10, nov: 10, december: 11, dec: 11
      };
      const month = months[match[1].toLowerCase()];
      const day = parseInt(match[2]);
      const year = today.getFullYear();
      const date = new Date(year, month, day);
      // If date has passed this year, assume next year
      if (date < today) {
        date.setFullYear(year + 1);
      }
      return date;
    }},
  ];

  let dateFound = false;
  for (const { pattern, handler } of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      result.date = handler(match);
      text = text.replace(match[0], '').trim();
      dateFound = true;
      break;
    }
  }

  // If no specific date, try relative dates
  if (!dateFound) {
    if (text.match(/\btomorrow\b/i)) {
      result.date = new Date(today);
      result.date.setDate(today.getDate() + 1);
      text = text.replace(/\btomorrow\b/gi, '').trim();
      dateFound = true;
    } else if (text.match(/\btoday\b/i)) {
      result.date = new Date(today);
      text = text.replace(/\btoday\b/gi, '').trim();
      dateFound = true;
    } else if (text.match(/\b(in\s+)?(\d+)\s+days?\b/i)) {
      const match = text.match(/\b(in\s+)?(\d+)\s+days?\b/i)!;
      const days = parseInt(match[2]);
      result.date = new Date(today);
      result.date.setDate(today.getDate() + days);
      text = text.replace(match[0], '').trim();
      dateFound = true;
    } else if (text.match(/\bnext\s+(week|month)\b/i)) {
      const match = text.match(/\bnext\s+(week|month)\b/i)!;
      result.date = new Date(today);
      if (match[1].toLowerCase() === 'week') {
        result.date.setDate(today.getDate() + 7);
      } else {
        result.date.setMonth(today.getMonth() + 1);
      }
      text = text.replace(match[0], '').trim();
      dateFound = true;
    } else if (text.match(/\b(this\s+)?(weekend)\b/i)) {
      result.date = new Date(today);
      const daysUntilSaturday = (6 - today.getDay() + 7) % 7 || 7;
      result.date.setDate(today.getDate() + daysUntilSaturday);
      text = text.replace(/\b(this\s+)?(weekend)\b/gi, '').trim();
      dateFound = true;
    }
  }

  // Day of week (e.g., "Monday", "next Friday")
  if (!dateFound) {
    const nextMatch = text.match(/\bnext\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);
    const thisMatch = text.match(/\b(this\s+)?(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i);

    if (nextMatch) {
      const dayName = nextMatch[1];
      result.date = getNextDayOfWeek(dayName, true); // force next week
      text = text.replace(nextMatch[0], '').trim();
      dateFound = true;
    } else if (thisMatch) {
      const dayName = thisMatch[2];
      result.date = getNextDayOfWeek(dayName, false);
      text = text.replace(thisMatch[0], '').trim();
      dateFound = true;
    }
  }

  // Default to today if no date found
  if (!dateFound) {
    result.date = new Date(today);
  }

  // Step 5: Extract time and duration
  let timeFound = false;
  let durationMinutes = 60; // default 1 hour

  // Check for duration first (e.g., "for 2 hours", "for 30 minutes", "for 90 min")
  const durationMatch = text.match(/\bfor\s+(\d+(?:\.\d+)?)\s*(hours?|hrs?|h|minutes?|mins?|m)\b/i);
  if (durationMatch) {
    const amount = parseFloat(durationMatch[1]);
    const unit = durationMatch[2].toLowerCase();
    if (unit.startsWith('h')) {
      durationMinutes = Math.round(amount * 60);
    } else {
      durationMinutes = Math.round(amount);
    }
    text = text.replace(durationMatch[0], '').trim();
  }

  // Time range (e.g., "from 2pm to 4pm", "2-4pm", "14:00-16:00")
  const timeRangePatterns = [
    /\bfrom\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s+to\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i,
    /\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*[-–]\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i,
  ];

  for (const pattern of timeRangePatterns) {
    const match = text.match(pattern);
    if (match) {
      let startHours = parseInt(match[1]);
      const startMinutes = match[2] ? parseInt(match[2]) : 0;
      const startMeridiem = (match[3] || '').toLowerCase();

      let endHours = parseInt(match[4]);
      const endMinutes = match[5] ? parseInt(match[5]) : 0;
      const endMeridiem = (match[6] || startMeridiem).toLowerCase();

      // Convert to 24-hour format
      if (startMeridiem === 'pm' && startHours !== 12) startHours += 12;
      if (startMeridiem === 'am' && startHours === 12) startHours = 0;
      if (endMeridiem === 'pm' && endHours !== 12) endHours += 12;
      if (endMeridiem === 'am' && endHours === 12) endHours = 0;

      result.startTime = `${startHours.toString().padStart(2, '0')}:${startMinutes.toString().padStart(2, '0')}`;
      result.endTime = `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;

      text = text.replace(match[0], '').trim();
      timeFound = true;
      break;
    }
  }

  // Single time (e.g., "at 3pm", "at 14:30", "at noon")
  if (!timeFound) {
    // Special times
    if (text.match(/\b(at\s+)?(noon|midday)\b/i)) {
      result.startTime = '12:00';
      result.endTime = calculateEndTime('12:00', durationMinutes);
      text = text.replace(/\b(at\s+)?(noon|midday)\b/gi, '').trim();
      timeFound = true;
    } else if (text.match(/\b(at\s+)?midnight\b/i)) {
      result.startTime = '00:00';
      result.endTime = calculateEndTime('00:00', durationMinutes);
      text = text.replace(/\b(at\s+)?midnight\b/gi, '').trim();
      timeFound = true;
    } else if (text.match(/\bin\s+the\s+(morning|afternoon|evening|night)\b/i)) {
      const match = text.match(/\bin\s+the\s+(morning|afternoon|evening|night)\b/i)!;
      const timeOfDay = match[1].toLowerCase();
      const defaultTimes: {[key: string]: string} = {
        morning: '09:00',
        afternoon: '14:00',
        evening: '18:00',
        night: '20:00'
      };
      result.startTime = defaultTimes[timeOfDay];
      result.endTime = calculateEndTime(result.startTime, durationMinutes);
      text = text.replace(match[0], '').trim();
      timeFound = true;
    } else {
      // Standard time format (at 3pm, at 14:30, 3:30pm)
      const timeMatch = text.match(/\b(?:at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
      if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        const meridiem = timeMatch[3]?.toLowerCase();

        // Convert to 24-hour format
        if (meridiem === 'pm' && hours !== 12) {
          hours += 12;
        } else if (meridiem === 'am' && hours === 12) {
          hours = 0;
        } else if (!meridiem) {
          // If no meridiem specified, use context-aware logic:
          // Hours 1-6 without meridiem are ambiguous:
          // - If currently in AM (before noon), assume AM
          // - If currently in PM (after noon), assume PM
          // Hours 7-11 without meridiem: keep as-is (morning interpretation)
          // Hour 12 without meridiem: keep as noon
          if (hours >= 1 && hours <= 6) {
            const currentHour = new Date().getHours();
            if (currentHour >= 12) {
              hours += 12; // Afternoon context
            }
          }
        }

        result.startTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        result.endTime = calculateEndTime(result.startTime, durationMinutes);

        text = text.replace(timeMatch[0], '').trim();
        timeFound = true;
      }
    }
  }

  // Default time if none found
  if (!timeFound) {
    result.startTime = '09:00';
    result.endTime = '10:00';
  }

  // Step 6: Extract category from keywords
  const categoryKeywords = {
    work: /\b(meeting|work|office|call|conference|standup|sync|client|presentation|review|deadline|project)\b/i,
    health: /\b(doctor|dentist|gym|exercise|health|workout|therapy|checkup|appointment|fitness|yoga|run|jog)\b/i,
    social: /\b(dinner|lunch|breakfast|brunch|coffee|party|hangout|drinks|celebration|birthday|date|movie)\b/i,
    education: /\b(class|study|course|lecture|learn|lesson|tutorial|workshop|seminar|training|exam|test)\b/i,
    travel: /\b(flight|trip|travel|vacation|hotel|airport|train|bus|drive|visit)\b/i,
    personal: /\b(personal|errands|shopping|groceries|laundry|cleaning|maintenance|chores|haircut)\b/i,
  };

  for (const [category, pattern] of Object.entries(categoryKeywords)) {
    if (originalText.match(pattern)) {
      result.categoryId = category;
      break;
    }
  }

  // Step 7: Extract title from remaining text
  if (!result.title) {
    // Remove common filler words
    text = text.replace(/\b(at|on|for|with|the|a|an|in|to|from)\b/gi, ' ').trim();
    // Remove extra spaces
    text = text.replace(/\s+/g, ' ').trim();

    if (text.length > 0) {
      // Capitalize first letter
      result.title = text.charAt(0).toUpperCase() + text.slice(1);
    } else {
      // Generate title from category if no text left
      const categoryTitles: {[key: string]: string} = {
        work: 'Work Event',
        health: 'Health Appointment',
        social: 'Social Event',
        education: 'Study Session',
        travel: 'Travel Plans',
        personal: 'Personal Task',
      };
      result.title = result.categoryId ? (categoryTitles[result.categoryId] || 'New Event') : 'New Event';
    }
  }

  return result as ParsedEvent;
}

/**
 * Get the next occurrence of a day of the week
 */
function getNextDayOfWeek(dayName: string, forceNextWeek: boolean = false): Date {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const targetDay = days.indexOf(dayName.toLowerCase());

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentDay = today.getDay();

  let daysUntilTarget = targetDay - currentDay;

  if (forceNextWeek || daysUntilTarget <= 0) {
    daysUntilTarget += 7;
  }

  const result = new Date(today);
  result.setDate(today.getDate() + daysUntilTarget);
  return result;
}

/**
 * Calculate end time given start time and duration in minutes
 */
function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const startMinutes = hours * 60 + minutes;
  const endMinutes = startMinutes + durationMinutes;

  const endHours = Math.floor(endMinutes / 60) % 24;
  const endMins = endMinutes % 60;

  return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
}

// Examples of supported formats:
// "Meeting tomorrow at 3pm" -> Meeting, tomorrow, 15:00-16:00
// "Doctor appointment next Monday at 10am for 30 minutes" -> Doctor appointment, next Monday, 10:00-10:30
// "Lunch from 12pm to 1:30pm" -> Lunch, today, 12:00-13:30
// "Gym workout Monday at 6am for 2 hours" -> Gym workout, next Monday, 06:00-08:00
// "High priority client call December 25 at 14:30" -> Client call, Dec 25, 14:30-15:30, high priority
// "Coffee chat @ Starbucks tomorrow afternoon" -> Coffee chat, tomorrow, 14:00-15:00, location: Starbucks
// "Meeting in 3 days at 10am for 90 minutes" -> Meeting, 3 days from now, 10:00-11:30
// "Team standup next Friday at noon" -> Team standup, next Friday, 12:00-13:00
// "Dinner this weekend at 7pm" -> Dinner, this Saturday, 19:00-20:00
// "Project deadline in 5 days" -> Project deadline, 5 days from now, 09:00-10:00
