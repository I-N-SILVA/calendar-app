'use client';

import { useState, useEffect } from 'react';
import { CalendarEvent } from '@/types/event';

export function useEvents() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedEvents = localStorage.getItem('calendar-events');
    if (savedEvents) {
      try {
        const parsedEvents = JSON.parse(savedEvents).map((event: CalendarEvent & { date: string }) => ({
          ...event,
          date: new Date(event.date),
          categoryId: event.categoryId || 'work' // Default to 'work' for existing events
        }));
        setEvents(parsedEvents);
      } catch (error) {
        console.error('Error parsing saved events:', error);
        setEvents([]);
      }
    }
    setIsLoading(false);
  }, []);

  const saveEvents = (newEvents: CalendarEvent[]) => {
    setEvents(newEvents);
    localStorage.setItem('calendar-events', JSON.stringify(newEvents));
  };

  const addEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    };
    const updatedEvents = [...events, newEvent];
    saveEvents(updatedEvents);
  };

  const updateEvent = (eventId: string, eventData: Omit<CalendarEvent, 'id'>) => {
    const updatedEvents = events.map(event =>
      event.id === eventId ? { ...eventData, id: eventId } : event
    );
    saveEvents(updatedEvents);
  };

  const deleteEvent = (eventId: string) => {
    const updatedEvents = events.filter(event => event.id !== eventId);
    saveEvents(updatedEvents);
  };

  const getEventById = (eventId: string) => {
    return events.find(event => event.id === eventId);
  };

  return {
    events,
    isLoading,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventById
  };
}