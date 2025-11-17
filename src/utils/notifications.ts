import { CalendarEvent } from '@/types/event';

export interface EventReminder {
  eventId: string;
  eventTitle: string;
  reminderTime: Date;
  notified: boolean;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
}

// Show notification
export function showNotification(title: string, body: string, icon?: string) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'calendar-event',
      requireInteraction: false,
    });
  }
}

// Calculate reminder time (15 minutes before event)
export function calculateReminderTime(event: CalendarEvent, minutesBefore = 15): Date {
  const eventDateTime = new Date(event.date);
  const [hour, min] = event.startTime.split(':').map(Number);
  eventDateTime.setHours(hour, min, 0, 0);

  const reminderTime = new Date(eventDateTime.getTime() - minutesBefore * 60 * 1000);
  return reminderTime;
}

// Check and trigger reminders
export function checkReminders(events: CalendarEvent[], onRemind: (event: CalendarEvent) => void) {
  const now = new Date();
  const upcomingEvents = events.filter(event => {
    const reminderTime = calculateReminderTime(event);
    const eventDateTime = new Date(event.date);
    const [hour, min] = event.startTime.split(':').map(Number);
    eventDateTime.setHours(hour, min, 0, 0);

    // Show reminder if we're past reminder time but before event start
    return reminderTime <= now && eventDateTime > now;
  });

  upcomingEvents.forEach(event => {
    onRemind(event);
  });
}

// Set up reminder interval
export function setupReminderInterval(
  events: CalendarEvent[],
  onRemind: (event: CalendarEvent) => void,
  intervalMs = 60000 // Check every minute
): () => void {
  const remindedEvents = new Set<string>();

  const interval = setInterval(() => {
    const now = new Date();

    events.forEach(event => {
      if (remindedEvents.has(event.id)) return;

      const reminderTime = calculateReminderTime(event);
      const eventDateTime = new Date(event.date);
      const [hour, min] = event.startTime.split(':').map(Number);
      eventDateTime.setHours(hour, min, 0, 0);

      // Show reminder if we're within 1 minute of reminder time and before event
      if (Math.abs(now.getTime() - reminderTime.getTime()) < 60000 && eventDateTime > now) {
        remindedEvents.add(event.id);
        onRemind(event);
      }

      // Clean up old events
      if (eventDateTime < now) {
        remindedEvents.delete(event.id);
      }
    });
  }, intervalMs);

  return () => clearInterval(interval);
}
