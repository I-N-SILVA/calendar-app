export interface EventCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // e.g., every 2 weeks = frequency: 'weekly', interval: 2
  endType: 'never' | 'after' | 'until';
  endValue?: number | Date; // count of occurrences or end date
  daysOfWeek?: number[]; // 0=Sunday, 1=Monday, etc. (for weekly)
  dayOfMonth?: number; // for monthly
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
}

export const DEFAULT_CATEGORIES: EventCategory[] = [
  { id: 'work', name: 'Work', color: 'from-blue-500 to-blue-600', icon: '💼' },
  { id: 'personal', name: 'Personal', color: 'from-green-500 to-green-600', icon: '🏠' },
  { id: 'health', name: 'Health', color: 'from-red-500 to-red-600', icon: '🏥' },
  { id: 'social', name: 'Social', color: 'from-purple-500 to-purple-600', icon: '👥' },
  { id: 'education', name: 'Education', color: 'from-yellow-500 to-yellow-600', icon: '📚' },
  { id: 'travel', name: 'Travel', color: 'from-indigo-500 to-indigo-600', icon: '✈️' },
  { id: 'other', name: 'Other', color: 'from-gray-500 to-gray-600', icon: '📋' }
];