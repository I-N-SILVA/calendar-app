'use client';

import { CalendarEvent, DEFAULT_CATEGORIES } from '@/types/event';
import { useRippleEffect } from '@/hooks/useRippleEffect';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { useContextMenu } from '@/hooks/useContextMenu';
import { useCalendarNavigation } from '@/contexts/CalendarNavigationContext';
import ContextMenu from './ContextMenu';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  onDateChange: (date: Date) => void;
  onEventMove?: (eventId: string, newDate: Date, newHour: number) => void;
  onEventDelete?: (eventId: string) => void;
  onEventDuplicate?: (event: CalendarEvent) => void;
}

export default function MonthView({ 
  currentDate, 
  events, 
  onEventClick, 
  onDateClick,
  onDateChange,
  onEventMove,
  onEventDelete,
  onEventDuplicate
}: MonthViewProps) {
  const createRipple = useRippleEffect();
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
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    onDateChange(newDate);
  };

  const formatMonth = (date: Date) => {
    const month = date.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
    const year = date.getFullYear();
    return `[${month}_${year}]`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    ).slice(0, 4); // Slightly more events for month view
  };

  const getDaysArray = () => {
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevMonthDate = new Date(year, month, -firstDayOfWeek + i + 1);
      days.push({ date: prevMonthDate, isCurrentMonth: false });
    }
    
    // Add all days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }
    
    // Add empty cells for days after the last day of the month to complete the grid
    const remainingCells = 42 - days.length; // 6 rows × 7 days = 42 cells
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonthDate = new Date(year, month + 1, i);
      days.push({ date: nextMonthDate, isCurrentMonth: false });
    }
    
    return days;
  };

  const weekdays = ['[SUN]', '[MON]', '[TUE]', '[WED]', '[THU]', '[FRI]', '[SAT]'];
  const days = getDaysArray();

  return (
    <div className="brutalist-card bg-card border-2 border-border spacing-mathematical">
      {/* ASCII Month Header */}
      <div className="border-b-2 border-border" style={{padding: 'var(--space-xl) var(--space-xl) var(--space-lg)'}}>
        <div className="ascii-divider text-xs mb-4">
          ████████████████████████████████████████
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="mono-heading text-foreground text-2xl tracking-wider">
              {formatMonth(currentDate)}
            </h2>
            <p className="text-muted-foreground font-mono text-sm uppercase tracking-wide mt-2">
              [MONTHLY_OVERVIEW]
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={(e) => {
                createRipple(e);
                navigateMonth('prev');
              }}
              className="brutalist-button ripple-effect flex items-center gap-2" 
              style={{padding: 'var(--space-md) var(--space-lg)'}}
            >
              <span className="text-lg">◀</span>
              [PREV]
            </button>
            <button
              onClick={(e) => {
                createRipple(e);
                onDateChange(new Date());
              }}
              className="brutalist-button bg-accent text-accent-foreground ripple-effect" 
              style={{padding: 'var(--space-md) var(--space-lg)'}}
            >
              [TODAY]
            </button>
            <button
              onClick={(e) => {
                createRipple(e);
                navigateMonth('next');
              }}
              className="brutalist-button ripple-effect flex items-center gap-2" 
              style={{padding: 'var(--space-md) var(--space-lg)'}}
            >
              [NEXT]
              <span className="text-lg">▶</span>
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 border-2 border-border" style={{gap: '2px', padding: 'var(--space-md)'}}>
        {/* Weekday headers */}
        {weekdays.map((day) => (
          <div 
            key={day} 
            className="bg-muted border-2 border-border text-center font-mono font-bold text-muted-foreground uppercase tracking-wider text-sm"
            style={{padding: 'var(--space-md)'}}
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map(({ date, isCurrentMonth }, index) => {
          const dayEvents = getEventsForDate(date);
          const today = isToday(date);
          const isVimSelected = isSelected(date);

          return (
            <div
              key={index}
              className={`border-2 cursor-pointer transition-all duration-200 min-h-[140px] ${
                isVimSelected
                  ? 'bg-secondary/30 border-secondary border-4 ring-4 ring-secondary/50'
                  : !isCurrentMonth
                  ? 'bg-muted/50 border-muted text-muted-foreground'
                  : today
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border hover:border-foreground hover:bg-muted'
              } ${isDragOverSlot(date, 12) ? 'drop-zone' : ''}`}
              style={{padding: 'var(--space-sm)'}}
              onClick={() => onDateClick?.(date)}
              onDragOver={(e) => handleDragOver(date, 12, e)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(date, 12, e)}
              aria-label={`${date.toLocaleDateString()}`}
              aria-selected={isVimSelected}
              role="gridcell"
              tabIndex={isVimSelected ? 0 : -1}
            >
              {/* Date Number */}
              <div className={`font-mono font-bold mb-2 ${
                today ? 'text-primary-foreground' : isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                <div className="text-lg">{date.getDate().toString().padStart(2, '0')}</div>
                {today && <div className="text-xs font-mono uppercase tracking-wide">[TODAY]</div>}
              </div>
              
              {/* Events */}
              <div className="space-y-1">
                {dayEvents.map((event) => {
                  const category = DEFAULT_CATEGORIES.find(cat => cat.id === event.categoryId) || DEFAULT_CATEGORIES[0];
                  
                  return (
                    <div
                      key={event.id}
                      className={`text-xs font-mono border-2 cursor-pointer transition-all duration-150 truncate ${
                        !isCurrentMonth ? 'opacity-50' : ''
                      } ${
                        today 
                          ? 'bg-background text-foreground border-background hover:bg-muted' 
                          : `${category.color} border-2 hover:transform hover:translate-x-1`
                      } ${draggedEvent?.id === event.id ? 'dragging-event' : ''}`}
                      style={{padding: 'var(--space-xs) var(--space-sm)'}}
                      draggable={isCurrentMonth}
                      onDragStart={(e) => handleDragStart(event, e)}
                      onDragEnd={handleDragEnd}
                      onMouseDown={(e) => handleMouseDown(event, e)}
                      onMouseMove={handleMouseMove}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClick(event, onEventClick);
                      }}
                      onContextMenu={(e) => showContextMenu(e, event)}
                    >
                      <div className="flex items-center gap-1">
                        <span className="font-bold">{category.icon}</span>
                        <span className="truncate uppercase tracking-wide">{event.title}</span>
                      </div>
                    </div>
                  );
                })}
                {dayEvents.length === 0 && isCurrentMonth && (
                  <div className="opacity-0 hover:opacity-100 transition-opacity">
                    <div className={`text-xs border-2 border-dashed font-mono ${
                      today ? 'text-primary-foreground border-primary-foreground' : 'text-muted-foreground border-muted-foreground'
                    }`} style={{padding: 'var(--space-xs) var(--space-sm)'}}>
                      [+ADD]
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="border-t-2 border-border text-center font-mono text-xs text-muted-foreground" style={{padding: 'var(--space-md)'}}>
        [CLICK_DATE_TO_CREATE] • [RIGHT_CLICK_EVENT_FOR_MENU] • [{events.length}_TOTAL_EVENTS]
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