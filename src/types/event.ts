export interface EventCategory {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  borderColorHex: string; // Hex color for inline styles
  icon: string;
  emoji: string;
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // e.g., every 2 weeks = frequency: 'weekly', interval: 2
  endType: 'never' | 'after' | 'until';
  endValue?: number | Date; // count of occurrences or end date
  daysOfWeek?: number[]; // 0=Sunday, 1=Monday, etc. (for weekly)
  dayOfMonth?: number; // for monthly
}

export type EventPriority = 'low' | 'medium' | 'high';
export type EventStatus = 'tentative' | 'confirmed' | 'cancelled';

export interface VoiceMemo {
  id: string;
  audioUrl: string; // Data URL or blob URL
  duration: number; // Duration in seconds
  timestamp: Date;
  name?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  description?: string;
  categoryId: string;
  recurrence?: RecurrenceRule;
  isRecurring?: boolean;
  originalEventId?: string; // for recurring event instances
  instanceDate?: Date; // specific date for this instance
  priority?: EventPriority;
  status?: EventStatus;
  location?: string;
  attendees?: string[];
  reminderMinutes?: number;
  voiceMemos?: VoiceMemo[];
}

export const DEFAULT_CATEGORIES: EventCategory[] = [
  {
    id: 'work',
    name: 'Work',
    color: 'bg-primary text-primary-foreground border-primary',
    bgColor: 'bg-blue-500',
    textColor: 'text-white',
    borderColor: 'border-blue-600',
    borderColorHex: '#2563eb',
    icon: '[W]',
    emoji: '💼'
  },
  {
    id: 'personal',
    name: 'Personal',
    color: 'bg-accent text-accent-foreground border-accent',
    bgColor: 'bg-purple-500',
    textColor: 'text-white',
    borderColor: 'border-purple-600',
    borderColorHex: '#9333ea',
    icon: '[P]',
    emoji: '⭐'
  },
  {
    id: 'health',
    name: 'Health',
    color: 'bg-destructive text-destructive-foreground border-destructive',
    bgColor: 'bg-red-500',
    textColor: 'text-white',
    borderColor: 'border-red-600',
    borderColorHex: '#dc2626',
    icon: '[H]',
    emoji: '❤️'
  },
  {
    id: 'social',
    name: 'Social',
    color: 'bg-secondary text-secondary-foreground border-secondary',
    bgColor: 'bg-pink-500',
    textColor: 'text-white',
    borderColor: 'border-pink-600',
    borderColorHex: '#db2777',
    icon: '[S]',
    emoji: '🎉'
  },
  {
    id: 'education',
    name: 'Education',
    color: 'bg-chart-3 text-background border-chart-3',
    bgColor: 'bg-yellow-500',
    textColor: 'text-black',
    borderColor: 'border-yellow-600',
    borderColorHex: '#ca8a04',
    icon: '[E]',
    emoji: '📚'
  },
  {
    id: 'travel',
    name: 'Travel',
    color: 'bg-chart-4 text-background border-chart-4',
    bgColor: 'bg-teal-500',
    textColor: 'text-white',
    borderColor: 'border-teal-600',
    borderColorHex: '#0d9488',
    icon: '[T]',
    emoji: '✈️'
  },
  {
    id: 'other',
    name: 'Other',
    color: 'bg-muted text-muted-foreground border-muted',
    bgColor: 'bg-gray-500',
    textColor: 'text-white',
    borderColor: 'border-gray-600',
    borderColorHex: '#4b5563',
    icon: '[O]',
    emoji: '📌'
  }
];