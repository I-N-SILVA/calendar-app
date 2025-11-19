import { CalendarEvent } from '@/types/event';

export interface EventTemplate {
  id: string;
  name: string;
  icon: string;
  template: Omit<CalendarEvent, 'id' | 'date'>;
}

export const DEFAULT_TEMPLATES: EventTemplate[] = [
  {
    id: 'standup',
    name: 'Daily Standup',
    icon: '👥',
    template: {
      title: 'Daily Standup',
      startTime: '09:00',
      endTime: '09:15',
      categoryId: 'work',
      priority: 'medium',
      status: 'confirmed',
      description: 'Daily team sync',
      reminderMinutes: 5,
    },
  },
  {
    id: 'lunch',
    name: 'Lunch Break',
    icon: '🍽️',
    template: {
      title: 'Lunch Break',
      startTime: '12:00',
      endTime: '13:00',
      categoryId: 'personal',
      priority: 'low',
      status: 'confirmed',
      reminderMinutes: 10,
    },
  },
  {
    id: 'meeting',
    name: '1-Hour Meeting',
    icon: '📅',
    template: {
      title: 'Meeting',
      startTime: '14:00',
      endTime: '15:00',
      categoryId: 'work',
      priority: 'medium',
      status: 'tentative',
      description: '',
      reminderMinutes: 15,
    },
  },
  {
    id: 'workout',
    name: 'Workout Session',
    icon: '💪',
    template: {
      title: 'Workout',
      startTime: '18:00',
      endTime: '19:00',
      categoryId: 'health',
      priority: 'high',
      status: 'confirmed',
      description: 'Exercise routine',
      reminderMinutes: 30,
    },
  },
  {
    id: 'focus',
    name: 'Focus Time',
    icon: '🎯',
    template: {
      title: 'Focus Time',
      startTime: '10:00',
      endTime: '12:00',
      categoryId: 'work',
      priority: 'high',
      status: 'confirmed',
      description: 'Deep work session - no interruptions',
      reminderMinutes: 15,
    },
  },
  {
    id: 'coffee',
    name: 'Coffee Chat',
    icon: '☕',
    template: {
      title: 'Coffee Chat',
      startTime: '15:00',
      endTime: '15:30',
      categoryId: 'social',
      priority: 'low',
      status: 'tentative',
      reminderMinutes: 15,
    },
  },
  {
    id: 'review',
    name: 'Code Review',
    icon: '💻',
    template: {
      title: 'Code Review',
      startTime: '16:00',
      endTime: '17:00',
      categoryId: 'work',
      priority: 'medium',
      status: 'confirmed',
      description: 'Review pull requests',
      reminderMinutes: 10,
    },
  },
  {
    id: 'dentist',
    name: 'Doctor/Dentist',
    icon: '🏥',
    template: {
      title: 'Doctor Appointment',
      startTime: '10:00',
      endTime: '11:00',
      categoryId: 'health',
      priority: 'high',
      status: 'confirmed',
      reminderMinutes: 60,
    },
  },
];

export function applyTemplate(template: EventTemplate, date: Date): Omit<CalendarEvent, 'id'> {
  return {
    ...template.template,
    date,
  };
}
