'use client';

import { useState, useEffect } from 'react';
import { CalendarEvent, DEFAULT_CATEGORIES } from '@/types/event';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { useContextMenu } from '@/hooks/useContextMenu';
import { useCalendarNavigation } from '@/contexts/CalendarNavigationContext';
import ContextMenu from './ContextMenu';
import GridEventCard from './GridEventCard';
import { groupConflictingEvents } from '@/utils/eventConflicts';

interface CalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
  onEventMove?: (eventId: string, newDate: Date, newHour: number) => void;
  onEventDelete?: (eventId: string) => void;
  onEventDuplicate?: (event: CalendarEvent) => void;
}

export default function Calendar({ events, onEventClick, onTimeSlotClick, onEventMove, onEventDelete, onEventDuplicate }: CalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());
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

  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    setCurrentWeekStart(startOfWeek);
  }, []);

  // Update current time every minute for the time indicator
  useEffect(() => {
    const updateTime = () => setCurrentTime(new Date());
    updateTime(); // Initial update

    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const getWeekDays = (startDate: Date) => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getEventsForDay = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    );
  };

  // Calculate event duration in hours
  const getEventDuration = (event: CalendarEvent) => {
    const [startHour, startMin] = event.startTime.split(':').map(Number);
    const [endHour, endMin] = event.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    return (endMinutes - startMinutes) / 60; // Duration in hours
  };

  // Check if an event should be rendered at a specific hour
  const shouldRenderEventAtHour = (event: CalendarEvent, hour: number) => {
    const startHour = parseInt(event.startTime.split(':')[0]);
    const endHour = parseInt(event.endTime.split(':')[0]);
    const endMinutes = parseInt(event.endTime.split(':')[1]);
    const actualEndHour = endMinutes > 0 ? endHour + 1 : endHour;
    return hour >= startHour && hour < actualEndHour;
  };

  // Check if this is the starting hour for an event
  const isEventStartHour = (event: CalendarEvent, hour: number) => {
    const startHour = parseInt(event.startTime.split(':')[0]);
    return hour === startHour;
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const weekDays = getWeekDays(currentWeekStart);

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentHour = (hour: number) => {
    const now = new Date();
    return now.getHours() === hour;
  };

  // Calculate position for current time indicator
  const getCurrentTimePosition = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    // Each hour slot is approximately 70px min-height
    // Position is calculated as: (hour * 70) + (minutes / 60 * 70)
    const hourHeight = 70;
    const position = (hours * hourHeight) + (minutes / 60 * hourHeight);
    return position;
  };

  // Check if current week contains today
  const isCurrentWeekToday = () => {
    const today = new Date();
    return weekDays.some(day => isToday(day));
  };

  // Get the column index for today (0-6 for Sun-Sat)
  const getTodayColumnIndex = () => {
    const today = new Date();
    return weekDays.findIndex(day => isToday(day));
  };

  return (
    <div className="bg-card shadow-2xl border border-border spacing-mathematical">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div className="text-center sm:text-left">
          <h2 className="text-xl sm:text-3xl font-bold text-foreground font-mono uppercase tracking-wider">
            Week of {formatDate(currentWeekStart)}
          </h2>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base font-mono uppercase tracking-wide">[CLICK_SLOT] // CREATE_EVENT</p>
        </div>
        <div className="flex gap-2 sm:gap-3 justify-center">
          <button
            onClick={() => navigateWeek('prev')}
            className="brutalist-button flex items-center gap-1 sm:gap-2 text-sm sm:text-base" style={{padding: 'var(--space-md) var(--space-lg)'}}
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </button>
          <button
            onClick={() => setCurrentWeekStart(new Date())}
            className="brutalist-button bg-accent text-accent-foreground text-sm sm:text-base" style={{padding: 'var(--space-md) var(--space-lg)'}}
          >
            Today
          </button>
          <button
            onClick={() => navigateWeek('next')}
            className="brutalist-button flex items-center gap-1 sm:gap-2 text-sm sm:text-base" style={{padding: 'var(--space-md) var(--space-lg)'}}
          >
            <span className="hidden sm:inline">Next</span>
            <span className="sm:hidden">Next</span>
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-8 bg-muted border border-border p-1 min-w-[800px] relative" style={{gap: 'var(--space-xs)'}}>
          {/* Current Time Indicator */}
          {isCurrentWeekToday() && (
            <div
              className="absolute left-0 right-0 z-20 pointer-events-none"
              style={{
                top: `${getCurrentTimePosition() + 45}px`, // +45px to account for header row
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

          <div className="bg-card font-bold text-center text-card-foreground border border-border font-mono uppercase tracking-wider" style={{padding: 'var(--space-sm) var(--space-lg)'}}>
            <span className="hidden sm:inline">[TIME]</span>
            <span className="sm:hidden">[T]</span>
          </div>
          {weekDays.map((day, index) => (
            <div key={index} className={`font-bold text-center transition-all border font-mono uppercase tracking-wider ${
              isToday(day) 
                ? 'bg-primary text-primary-foreground border-primary' 
                : 'bg-card text-card-foreground hover:bg-muted border-border'
            }`} style={{padding: 'var(--space-sm) var(--space-lg)'}}>
              <div className="text-xs sm:text-sm">{formatDate(day)}</div>
              {isToday(day) && <div className="text-xs mt-1 opacity-90">Today</div>}
            </div>
          ))}

        {hours.map(hour => {
          const timeString = hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
          const isCurrentTime = isCurrentHour(hour) && weekDays.some(day => isToday(day));
          
          return (
            <div key={hour} className="contents">
              <div className={`text-xs sm:text-sm font-semibold transition-all border font-mono uppercase tracking-wider ${
                isCurrentTime 
                  ? 'bg-accent text-accent-foreground border-accent' 
                  : 'bg-card text-card-foreground border-border'
              }`} style={{padding: 'var(--space-sm) var(--space-lg)'}}>
                <div className="truncate">{timeString}</div>
                {isCurrentTime && <div className="text-xs opacity-75 mt-1">Now</div>}
              </div>
              {weekDays.map((day, dayIndex) => {
                const dayEvents = getEventsForDay(day);
                const eventsAtThisHour = dayEvents.filter(event => shouldRenderEventAtHour(event, hour));
                const eventsStartingHere = dayEvents.filter(event => isEventStartHour(event, hour));
                
                const isTodaySlot = isToday(day);
                const isCurrentSlot = isTodaySlot && isCurrentHour(hour);
                const isVimSelected = isSelected(day, hour);

                return (
                  <div
                    key={`${hour}-${dayIndex}`}
                    className={`p-2 min-h-[70px] cursor-pointer transition-all duration-200 relative border ${
                      isVimSelected
                        ? 'bg-secondary/30 border-secondary border-4 ring-4 ring-secondary/50'
                        : isDragOverSlot(day, hour)
                        ? 'bg-destructive/20 border-destructive border-4'
                        : isCurrentSlot
                        ? 'bg-accent/20 border-accent border-2'
                        : isTodaySlot
                        ? 'bg-primary/10 hover:bg-primary/20 border-primary/30'
                        : 'bg-card hover:bg-muted border-border'
                    } ${isDragging ? 'drop-zone' : ''}`}
                    aria-label={`${day.toLocaleDateString()} at ${hour}:00`}
                    aria-selected={isVimSelected}
                    role="gridcell"
                    tabIndex={isVimSelected ? 0 : -1}
                    onClick={() => onTimeSlotClick?.(day, hour)}
                    onDragOver={(e) => handleDragOver(day, hour, e)}
                    onDragLeave={(e) => handleDragLeave(e)}
                    onDrop={(e) => handleDrop(day, hour, e)}
                  >
                    {/* Render events that span through this hour with reduced opacity */}
                    {eventsAtThisHour.filter(event => !isEventStartHour(event, hour)).length > 0 && (
                      <div className="mb-1 flex gap-0.5">
                        {eventsAtThisHour.filter(event => !isEventStartHour(event, hour)).map(event => (
                          <div key={`${event.id}-continuation-${hour}`} className="flex-1 min-w-0">
                            <GridEventCard
                              event={event}
                              isContinuation={true}
                              onClick={onEventClick}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Render events that start at this hour with conflict handling */}
                    {(() => {
                      if (eventsStartingHere.length === 0) return null;

                      // Group conflicting events
                      const conflictGroups = groupConflictingEvents(eventsStartingHere);

                      return conflictGroups.map((group, groupIndex) => {
                        // If group has only one event or no conflicts, render normally
                        if (group.events.length === 1) {
                          const event = group.events[0];
                          const duration = getEventDuration(event);

                          return (
                            <div key={event.id} className="mb-1">
                              <GridEventCard
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
                                className="hover:scale-[1.02] hover:shadow-md"
                              />
                            </div>
                          );
                        }

                        // Render conflicting events side-by-side
                        return (
                          <div
                            key={`conflict-group-${groupIndex}`}
                            className="mb-1 flex gap-0.5"
                            style={{
                              gridTemplateColumns: `repeat(${group.columns}, 1fr)`,
                            }}
                          >
                            {group.events.map(event => {
                              const duration = getEventDuration(event);
                              const position = group.positions.get(event.id);

                              return (
                                <div
                                  key={event.id}
                                  className="flex-1 min-w-0"
                                  style={{
                                    gridColumn: position
                                      ? `${position.column + 1} / span ${position.span}`
                                      : undefined,
                                  }}
                                >
                                  <GridEventCard
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
                                    className="hover:scale-[1.01] hover:shadow-md"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        );
                      });
                    })()}
                    {eventsAtThisHour.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div className="text-muted-foreground text-xs font-medium">+ Add Event</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
        </div>
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