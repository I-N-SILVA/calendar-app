'use client';

import { useState } from 'react';
import { CalendarEvent } from '@/types/event';

export function useDragAndDrop(
  onEventMove: (eventId: string, newDate: Date, newHour: number) => void
) {
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverSlot, setDragOverSlot] = useState<{ date: Date; hour: number } | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [hasDragMoved, setHasDragMoved] = useState(false);

  const handleDragStart = (event: CalendarEvent, e: React.DragEvent) => {
    setDraggedEvent(event);
    setIsDragging(true);
    setHasDragMoved(false);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    
    // Set drag effect
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', event.id);
    
    // Create custom drag image for brutalist effect
    const dragImage = document.createElement('div');
    dragImage.textContent = `[DRAGGING] ${event.title}`;
    dragImage.style.cssText = `
      position: absolute;
      top: -1000px;
      background: var(--foreground);
      color: var(--background);
      padding: 8px 16px;
      font-family: var(--font-mono);
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border: 2px solid var(--foreground);
      z-index: 9999;
    `;
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 50, 20);
    
    // Clean up drag image after a short delay
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
    
    // Brutalist drag feedback on original element
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.7';
      e.currentTarget.style.transform = 'rotate(2deg) scale(1.05)';
      e.currentTarget.style.border = '2px dashed var(--foreground)';
      e.currentTarget.style.zIndex = '1000';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedEvent(null);
    setIsDragging(false);
    setDragOverSlot(null);
    setDragStartPos(null);
    setHasDragMoved(false);
    
    // Reset brutalist visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.border = '';
      e.currentTarget.style.zIndex = '';
    }
  };

  const handleDragOver = (date: Date, hour: number, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    setDragOverSlot({ date, hour });
    
    // Add brutalist hover effect to drop zone
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.boxShadow = '4px 4px 0px var(--foreground)';
      e.currentTarget.style.transform = 'translate(-2px, -2px)';
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    setDragOverSlot(null);
    
    // Reset brutalist hover effect
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.boxShadow = '';
      e.currentTarget.style.transform = '';
    }
  };

  const handleDrop = (date: Date, hour: number, e: React.DragEvent) => {
    e.preventDefault();
    
    const eventId = e.dataTransfer.getData('text/plain');
    if (eventId && draggedEvent) {
      // Brutalist drop animation
      if (e.currentTarget instanceof HTMLElement) {
        const element = e.currentTarget as HTMLElement;
        element.style.backgroundColor = 'var(--primary)';
        element.style.transform = 'scale(1.1)';
        setTimeout(() => {
          element.style.backgroundColor = '';
          element.style.transform = '';
          element.style.boxShadow = '';
        }, 200);
      }
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

  // Add mouse handlers to help distinguish click from drag
  const handleMouseDown = (event: CalendarEvent, e: React.MouseEvent) => {
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setHasDragMoved(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragStartPos) {
      const distance = Math.sqrt(
        Math.pow(e.clientX - dragStartPos.x, 2) + 
        Math.pow(e.clientY - dragStartPos.y, 2)
      );
      if (distance > 5) { // 5px threshold
        setHasDragMoved(true);
      }
    }
  };

  const handleClick = (event: CalendarEvent, onClick?: (event: CalendarEvent) => void) => {
    // Only trigger click if we haven't moved significantly
    if (!hasDragMoved && onClick) {
      onClick(event);
    }
  };

  return {
    draggedEvent,
    isDragging,
    hasDragMoved,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    isDragOverSlot,
    handleMouseDown,
    handleMouseMove,
    handleClick
  };
}