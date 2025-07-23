'use client';

import { useState } from 'react';
import { CalendarEvent } from '@/types/event';

export function useDragAndDrop(
  onEventMove: (eventId: string, newDate: Date, newHour: number) => void
) {
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverSlot, setDragOverSlot] = useState<{ date: Date; hour: number } | null>(null);

  const handleDragStart = (event: CalendarEvent, e: React.DragEvent) => {
    setDraggedEvent(event);
    setIsDragging(true);
    
    // Set drag effect
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', event.id);
    
    // Add some visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedEvent(null);
    setIsDragging(false);
    setDragOverSlot(null);
    
    // Reset visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (date: Date, hour: number, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    setDragOverSlot({ date, hour });
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = (date: Date, hour: number, e: React.DragEvent) => {
    e.preventDefault();
    
    const eventId = e.dataTransfer.getData('text/plain');
    if (eventId && draggedEvent) {
      onEventMove(eventId, date, hour);
    }
    
    setDraggedEvent(null);
    setIsDragging(false);
    setDragOverSlot(null);
  };

  const isDragOverSlot = (date: Date, hour: number) => {
    return dragOverSlot && 
           dragOverSlot.date.toDateString() === date.toDateString() && 
           dragOverSlot.hour === hour;
  };

  return {
    draggedEvent,
    isDragging,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    isDragOverSlot
  };
}