'use client';

import { useEffect, useState } from 'react';
import { CalendarEvent } from '@/types/event';

export function useNotifications(events: CalendarEvent[]) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [notifiedEvents, setNotifiedEvents] = useState<Set<string>>(new Set());

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return permission;
  };

  useEffect(() => {
    if (permission !== 'granted' || !events.length) return;

    const checkInterval = setInterval(() => {
      const now = new Date();

      events.forEach(event => {
        if (event.status === 'cancelled') return;
        if (notifiedEvents.has(event.id)) return;

        const reminderMinutes = event.reminderMinutes || 15; // Default 15 min
        const eventDateTime = new Date(event.date);
        const [hours, minutes] = event.startTime.split(':').map(Number);
        eventDateTime.setHours(hours, minutes, 0, 0);

        const reminderTime = new Date(eventDateTime.getTime() - reminderMinutes * 60 * 1000);
        const timeDiff = reminderTime.getTime() - now.getTime();

        // Show notification if within 1 minute of reminder time
        if (timeDiff > 0 && timeDiff <= 60000) {
          showNotification(event, reminderMinutes);
          setNotifiedEvents(prev => new Set(prev).add(event.id));
        }
      });
    }, 30000); // Check every 30 seconds

    return () => clearInterval(checkInterval);
  }, [events, permission, notifiedEvents]);

  const showNotification = (event: CalendarEvent, reminderMinutes: number) => {
    const category = event.categoryId.charAt(0).toUpperCase() + event.categoryId.slice(1);
    const priority = event.priority ? `[${event.priority.toUpperCase()}]` : '';

    new Notification(`${priority} ${event.title}`, {
      body: `${category} event in ${reminderMinutes} minutes\n${event.startTime} - ${event.endTime}${event.location ? `\n📍 ${event.location}` : ''}`,
      icon: '/calendar-icon.png',
      tag: event.id,
      requireInteraction: event.priority === 'high',
    });
  };

  return {
    permission,
    requestPermission,
    hasNotificationSupport: 'Notification' in window,
  };
}
