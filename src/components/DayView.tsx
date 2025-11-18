'use client';

import { useState, useEffect } from 'react';
import { CalendarEvent, DEFAULT_CATEGORIES } from '@/types/event';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { useContextMenu } from '@/hooks/useContextMenu';
import { useCalendarNavigation } from '@/contexts/CalendarNavigationContext';
import ContextMenu from './ContextMenu';
import GridEventCard from './GridEventCard';

interface DayViewProps {
  selectedDate: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
  onDateChange: (date: Date) => void;
  onEventMove?: (eventId: string, newDate: Date, newHour: number) => void;
  onEventDelete?: (eventId: string) => void;
  onEventDuplicate?: (event: CalendarEvent) => void;
}

export default function DayView({
  selectedDate,
  events,
  onEventClick,
  onTimeSlotClick,
  onDateChange,
  onEventMove,
  onEventDelete,
  onEventDuplicate
}: DayViewProps) {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  const {
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
  } = useDragAndDrop(onEventMove || (() => {}));

  const { contextMenu, showContextMenu, hideContextMenu } = useContextMenu();
  const { isSelected } = useCalendarNavigation();
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Update current time every minute for the time indicator
  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date());
    updateTime(); // Initial update

    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);
  
  const isCurrentHour = (hour: number) => {
    const now = new Date();
    return now.getHours() === hour && selectedDate.toDateString() === now.toDateString();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric',
      month: 'long', 
      day: 'numeric' 
    });
  };

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    onDateChange(newDate);
  };

  // Calculate event duration in hours
  const getEventDuration = (event: CalendarEvent) => {
    const [startHour, startMin] = event.startTime.split(':').map(Number);
    const [endHour, endMin] = event.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return (endMinutes - startMinutes) / 60; // Duration in hours
  };

  const getEventsForHour = (hour: number) => {
    return events.filter(event => {
      if (event.date.toDateString() !== selectedDate.toDateString()) return false;
      const eventStartHour = parseInt(event.startTime.split(':')[0]);
      const eventEndHour = parseInt(event.endTime.split(':')[0]);
      const eventEndMin = parseInt(event.endTime.split(':')[1]);
      
      // Include if event starts at this hour OR spans through this hour
      return eventStartHour <= hour && (eventEndHour > hour || (eventEndHour === hour && eventEndMin > 0));
    });
  };

  const getEventsStartingAtHour = (hour: number) => {
    return events.filter(event => {
      if (event.date.toDateString() !== selectedDate.toDateString()) return false;
      const eventHour = parseInt(event.startTime.split(':')[0]);
      return eventHour === hour;
    });
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  // Calculate position for current time indicator
  const getCurrentTimePosition = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    // Each hour slot is approximately 85px min-height (80px + 5px gap)
    const hourHeight = 85;
    const position = (hours * hourHeight) + (minutes / 60 * hourHeight);
    return position;
  };

  return (
    <div className="bg-card rounded-2xl shadow-2xl p-8 border border-border">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {formatDate(selectedDate)}
          </h2>
          <p className="text-muted-foreground mt-1">
            {isToday ? 'Today\'s Schedule' : 'Daily Schedule'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigateDay('prev')}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          <button
            onClick={() => onDateChange(new Date())}
            className="px-6 py-3 bg-accent text-accent-foreground rounded-xl hover:opacity-90 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Today
          </button>
          <button
            onClick={() => navigateDay('next')}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            Next
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-1 max-h-[600px] overflow-y-auto relative">
        {/* Current Time Indicator */}
        {isToday && (
          <div
            className="absolute left-0 right-0 z-20 pointer-events-none"
            style={{
              top: `${getCurrentTimePosition()}px`,
              height: '3px',
              background: 'var(--calendar-current-time, #ef4444)',
              boxShadow: '0 0 4px rgba(239, 68, 68, 0.5)',
            }}
          >
            {/* Time indicator dot on the left */}
            <div
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1"
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: 'var(--calendar-current-time, #ef4444)',
                boxShadow: '0 0 6px rgba(239, 68, 68, 0.7)',
              }}
            />
            {/* Current time label */}
            <div
              className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-mono font-bold px-2 py-1 rounded"
              style={{
                background: 'var(--calendar-current-time, #ef4444)',
                color: 'white',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              {currentTime.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
            </div>
          </div>
        )}

        {hours.map(hour => {
          const hourEvents = getEventsForHour(hour);
          const eventsStartingHere = getEventsStartingAtHour(hour);
          const eventsSpanningThrough = hourEvents.filter(event => {
            const eventStartHour = parseInt(event.startTime.split(':')[0]);
            return eventStartHour < hour;
          });
          const timeString = hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
          const isCurrentTime = isCurrentHour(hour);
          const isVimSelected = isSelected(selectedDate, hour);

          return (
            <div key={hour} className="flex">
              <div className={`w-24 p-4 text-sm font-semibold rounded-l-xl transition-all ${
                isCurrentTime
                  ? 'bg-accent text-accent-foreground border-accent'
                  : 'bg-card text-card-foreground border-border'
              }`}>
                <div>{timeString}</div>
                {isCurrentTime && <div className="text-xs opacity-75 mt-1">Now</div>}
              </div>
              <div
                className={`flex-1 p-4 min-h-[80px] cursor-pointer transition-all duration-200 rounded-r-xl border-l-2 ${
                  isVimSelected
                    ? 'bg-secondary/30 border-secondary border-4 ring-4 ring-secondary/50'
                    : isCurrentTime
                    ? 'bg-accent/20 border-accent'
                    : isToday
                    ? 'bg-primary/10 hover:bg-primary/20 border-primary/30'
                    : 'bg-card hover:bg-muted border-border'
                } hover:shadow-md ${isDragOverSlot(selectedDate, hour) ? 'drop-zone' : ''}`}
                aria-label={`${timeString} on ${formatDate(selectedDate)}`}
                aria-selected={isVimSelected}
                role="gridcell"
                tabIndex={isVimSelected ? 0 : -1}
                onClick={() => onTimeSlotClick?.(selectedDate, hour)}
                onDragOver={(e) => handleDragOver(selectedDate, hour, e)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(selectedDate, hour, e)}
              >
                {/* Show spanning events with reduced opacity */}
                {eventsSpanningThrough.map(event => (
                  <GridEventCard
                    key={`${event.id}-span-${hour}`}
                    event={event}
                    isContinuation={true}
                    onClick={onEventClick}
                    onContextMenu={showContextMenu}
                    className="mb-2"
                  />
                ))}

                {/* Show events starting at this hour */}
                {eventsStartingHere.length === 0 && eventsSpanningThrough.length === 0 ? (
                  <div className="flex items-center h-full opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-muted-foreground text-sm font-medium">+ Add Event</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {eventsStartingHere.map(event => {
                      const duration = getEventDuration(event);

                      return (
                        <GridEventCard
                          key={event.id}
                          event={event}
                          duration={duration}
                          isDragging={draggedEvent?.id === event.id}
                          onClick={onEventClick}
                          onEdit={onEventClick}
                          onDelete={onEventDelete}
                          onDuplicate={onEventDuplicate}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                          onMouseDown={handleMouseDown}
                          onMouseMove={handleMouseMove}
                          onContextMenu={showContextMenu}
                          className="hover:scale-[1.01] hover:shadow-lg"
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          event={contextMenu.event}
          onClose={hideContextMenu}
          onEdit={(event) => onEventClick?.(event)}
          onDelete={(eventId) => onEventDelete?.(eventId)}
          onDuplicate={(event) => onEventDuplicate?.(event)}
        />
      )}
    </div>
  );
}