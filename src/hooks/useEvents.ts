'use client';

import { useState, useEffect, useMemo } from 'react';
import { CalendarEvent } from '@/types/event';
import { generateRecurringEvents } from '@/utils/recurrence';

export function useEvents() {
  const [baseEvents, setBaseEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Generate all event instances including recurring ones
  const events = useMemo(() => {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 2); // 2 months before
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 12); // 12 months after

    const allEvents: CalendarEvent[] = [];
    
    baseEvents.forEach(event => {
      if (event.isRecurring && event.recurrence) {
        const recurringEvents = generateRecurringEvents(event, startDate, endDate);
        allEvents.push(...recurringEvents);
      } else {
        allEvents.push(event);
      }
    });

    return allEvents;
  }, [baseEvents]);

  useEffect(() => {
    const savedEvents = localStorage.getItem('calendar-events');
    if (savedEvents) {
      try {
        const parsedEvents = JSON.parse(savedEvents).map((event: CalendarEvent & { date: string }) => ({
          ...event,
          date: new Date(event.date),
          categoryId: event.categoryId || 'work', // Default to 'work' for existing events
          isRecurring: event.isRecurring || false,
          recurrence: event.recurrence
        }));
        setBaseEvents(parsedEvents);
      } catch (error) {
        console.error('Error parsing saved events:', error);
        // Try to backup corrupted data
        const backupKey = `calendar-events-backup-${Date.now()}`;
        localStorage.setItem(backupKey, savedEvents);
        console.log(`Corrupted data backed up to ${backupKey}`);
        setBaseEvents([]);
      }
    }
    setIsLoading(false);
  }, []);

  const saveBaseEvents = (newEvents: CalendarEvent[]) => {
    setBaseEvents(newEvents);
    try {
      localStorage.setItem('calendar-events', JSON.stringify(newEvents));
    } catch (error) {
      console.error('Error saving events:', error);
      throw new Error('Failed to save events. Storage may be full.');
    }
  };

  const addEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 11)
    };
    const updatedEvents = [...baseEvents, newEvent];
    saveBaseEvents(updatedEvents);
  };

  const updateEvent = (eventId: string, eventData: Omit<CalendarEvent, 'id'>) => {
    const updatedEvents = baseEvents.map(event =>
      event.id === eventId ? { ...eventData, id: eventId } : event
    );
    saveBaseEvents(updatedEvents);
  };

  const deleteEvent = (eventId: string) => {
    // For recurring events, delete the base event (which removes all instances)
    const updatedEvents = baseEvents.filter(event => 
      event.id !== eventId && event.originalEventId !== eventId
    );
    saveBaseEvents(updatedEvents);
  };

  const getEventById = (eventId: string) => {
    return baseEvents.find(event => event.id === eventId);
  };

  const importEvents = (importedEvents: CalendarEvent[]) => {
    const updatedEvents = [...baseEvents, ...importedEvents];
    saveBaseEvents(updatedEvents);
  };

  return {
    events,
    baseEvents,
    isLoading,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventById,
    importEvents
  };
}