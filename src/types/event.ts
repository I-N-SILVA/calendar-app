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
  { id: 'work', name: 'Work', color: 'bg-primary text-primary-foreground border-primary', icon: '[W]' },
  { id: 'personal', name: 'Personal', color: 'bg-accent text-accent-foreground border-accent', icon: '[P]' },
  { id: 'health', name: 'Health', color: 'bg-destructive text-destructive-foreground border-destructive', icon: '[H]' },
  { id: 'social', name: 'Social', color: 'bg-secondary text-secondary-foreground border-secondary', icon: '[S]' },
  { id: 'education', name: 'Education', color: 'bg-chart-3 text-background border-chart-3', icon: '[E]' },
  { id: 'travel', name: 'Travel', color: 'bg-chart-4 text-background border-chart-4', icon: '[T]' },
  { id: 'other', name: 'Other', color: 'bg-muted text-muted-foreground border-muted', icon: '[O]' }
];