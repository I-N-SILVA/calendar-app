'use client';

import { useState } from 'react';
import Calendar from '@/components/Calendar';
import DayView from '@/components/DayView';
import MonthView from '@/components/MonthView';
import ViewSelector, { ViewMode } from '@/components/ViewSelector';
import SearchAndFilter from '@/components/SearchAndFilter';
import ThemeToggle from '@/components/ThemeToggle';
import EventModal from '@/components/EventModal';
import CommandPalette from '@/components/CommandPalette';
import { useEvents } from '@/hooks/useEvents';
import { useCommandPalette } from '@/hooks/useCommandPalette';
import { useRippleEffect } from '@/hooks/useRippleEffect';
import { useVimNavigation } from '@/hooks/useVimNavigation';
import { CalendarEvent } from '@/types/event';
import KeyboardHints from '@/components/KeyboardHints';
import TimeAnalytics from '@/components/TimeAnalytics';

export default function Home() {
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();
  const { isOpen: isCommandPaletteOpen, openPalette, closePalette } = useCommandPalette();
  const createRipple = useRippleEffect();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedHour, setSelectedHour] = useState<number>();
  const [editingEvent, setEditingEvent] = useState<CalendarEvent>();
  const [currentView, setCurrentView] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Vim navigation setup
  const { isVimMode, showHints, setShowHints } = useVimNavigation({
    enabled: true,
    onMoveUp: () => {
      console.log('Vim: Move Up');
    },
    onMoveDown: () => {
      console.log('Vim: Move Down');
    },
    onMoveLeft: () => {
      console.log('Vim: Move Left');
    },
    onMoveRight: () => {
      console.log('Vim: Move Right');
    },
    onSelect: () => {
      setSelectedDate(new Date());
      setSelectedHour(new Date().getHours());
      setEditingEvent(undefined);
      setIsModalOpen(true);
    },
    onEscape: () => {
      setIsModalOpen(false);
    }
  });

  const handleTimeSlotClick = (date: Date, hour: number) => {
    setSelectedDate(date);
    setSelectedHour(hour);
    setEditingEvent(undefined);
    setIsModalOpen(true);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedHour(undefined);
    setEditingEvent(undefined);
    setIsModalOpen(true);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setEditingEvent(event);
    setSelectedDate(undefined);
    setSelectedHour(undefined);
    setIsModalOpen(true);
  };

  const handleSaveEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    if (editingEvent) {
      updateEvent(editingEvent.id, eventData);
    } else {
      addEvent(eventData);
    }
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      deleteEvent(eventId);
      setIsModalOpen(false);
    }
  };

  const handleDuplicateEvent = (eventToDuplicate: CalendarEvent) => {
    const { id, ...eventWithoutId } = eventToDuplicate;
    const duplicatedEvent = {
      ...eventWithoutId,
      title: `${eventToDuplicate.title} (Copy)`,
      date: new Date(eventToDuplicate.date.getTime() + 24 * 60 * 60 * 1000), // Next day
    };
    addEvent(duplicatedEvent);
  };

  const handleEventMove = (eventId: string, newDate: Date, newHour: number) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    // Calculate new start and end times
    const newStartTime = `${newHour.toString().padStart(2, '0')}:00`;
    const originalStartHour = parseInt(event.startTime.split(':')[0]);
    const originalEndHour = parseInt(event.endTime.split(':')[0]);
    const duration = originalEndHour - originalStartHour;
    const newEndHour = newHour + duration;
    const newEndTime = `${newEndHour.toString().padStart(2, '0')}:00`;

    // Update the event
    updateEvent(eventId, {
      ...event,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime
    });
  };

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6 transition-colors duration-200 crt-effect">
      <div className="max-w-7xl mx-auto">
        {/* Theme Toggle - Fixed Position */}
        <div className="fixed top-6 left-6 z-50">
          <ThemeToggle />
        </div>
        <div className="mb-12">
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-4 font-mono uppercase tracking-wide blinking-cursor">
              [CALENDAR] {isVimMode && <span className="text-primary text-xl">[VIM]</span>}
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg transition-colors duration-200 font-mono uppercase tracking-wide font-medium leading-relaxed">
              SCHEDULE // ORGANIZE // EXECUTE
            </p>
          </div>
          
          {/* ASCII Divider */}
          <div className="ascii-divider text-sm mb-12">
            ≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 sm:gap-8 mb-12">
            <ViewSelector 
              currentView={currentView} 
              onViewChange={setCurrentView} 
            />
            <div className="flex gap-3">
              <button
                onClick={(e) => {
                  createRipple(e);
                  openPalette();
                }}
                className="brutalist-button bg-accent text-accent-foreground flex items-center gap-2 text-base sm:text-lg font-semibold ripple-effect" style={{padding: 'var(--space-md) var(--space-xl)'}}
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3" />
                </svg>
                <span className="hidden sm:inline">[CMD+K]</span>
                <span className="sm:hidden">[K]</span>
              </button>
              <button
                onClick={(e) => {
                  createRipple(e);
                  setShowAnalytics(!showAnalytics);
                }}
                className={`brutalist-button flex items-center gap-2 text-base sm:text-lg font-semibold ripple-effect ${
                  showAnalytics
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-chart-3 text-background'
                }`} style={{padding: 'var(--space-md) var(--space-xl)'}}
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="hidden sm:inline">[STATS]</span>
                <span className="sm:hidden">[S]</span>
              </button>
              <button
                onClick={(e) => {
                  createRipple(e);
                  setShowSearch(!showSearch);
                }}
                className={`brutalist-button flex items-center gap-2 text-base sm:text-lg font-semibold ripple-effect ${
                  showSearch
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground'
                }`} style={{padding: 'var(--space-md) var(--space-xl)'}}
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden sm:inline">Search</span>
              </button>
              <button
                onClick={(e) => {
                  createRipple(e);
                  setSelectedDate(new Date());
                  setSelectedHour(new Date().getHours());
                  setEditingEvent(undefined);
                  setIsModalOpen(true);
                }}
                className="brutalist-button bg-primary text-primary-foreground flex items-center gap-3 text-base sm:text-lg font-semibold w-full sm:w-auto justify-center ripple-effect" style={{padding: 'var(--space-md) var(--space-xl)'}}
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Event
              </button>
            </div>
          </div>
        </div>

        {showSearch && (
          <>
            <div className="ascii-divider text-xs mb-8">
              ∙∙∙∙∙∙∙∙∙ [SEARCH_FILTER] ∙∙∙∙∙∙∙∙∙
            </div>
            <SearchAndFilter
              events={events}
              onFilteredEventsChange={setFilteredEvents}
            />
          </>
        )}

        {showAnalytics && (
          <>
            <div className="ascii-divider text-xs mb-8">
              ◆◆◆◆◆◆◆◆◆ [TIME_ANALYTICS] ◆◆◆◆◆◆◆◆◆
            </div>
            <TimeAnalytics events={events} />
          </>
        )}

        {/* ASCII Section Divider */}
        <div className="ascii-divider text-xs my-12">
          ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
        </div>
        
        <div className="transition-all duration-300 ease-in-out">
          {currentView === 'week' && (
            <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
              <Calendar
                events={showSearch && filteredEvents.length >= 0 ? filteredEvents : events}
                onEventClick={handleEventClick}
                onTimeSlotClick={handleTimeSlotClick}
                onEventMove={handleEventMove}
                onEventDelete={handleDeleteEvent}
                onEventDuplicate={handleDuplicateEvent}
              />
            </div>
          )}
        </div>

        <div className="transition-all duration-300 ease-in-out">
          {currentView === 'day' && (
            <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
              <DayView
                selectedDate={currentDate}
                events={showSearch && filteredEvents.length >= 0 ? filteredEvents : events}
                onEventClick={handleEventClick}
                onTimeSlotClick={handleTimeSlotClick}
                onDateChange={setCurrentDate}
                onEventMove={handleEventMove}
                onEventDelete={handleDeleteEvent}
                onEventDuplicate={handleDuplicateEvent}
              />
            </div>
          )}
        </div>

        <div className="transition-all duration-300 ease-in-out">
          {currentView === 'month' && (
            <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
              <MonthView
                currentDate={currentDate}
                events={showSearch && filteredEvents.length >= 0 ? filteredEvents : events}
                onEventClick={handleEventClick}
                onDateClick={handleDateClick}
                onDateChange={setCurrentDate}
                onEventMove={handleEventMove}
                onEventDelete={handleDeleteEvent}
                onEventDuplicate={handleDuplicateEvent}
              />
            </div>
          )}
        </div>

        <EventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          selectedDate={selectedDate}
          selectedHour={selectedHour}
          editingEvent={editingEvent}
        />

        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={closePalette}
          onCreateEvent={() => {
            setSelectedDate(new Date());
            setSelectedHour(new Date().getHours());
            setEditingEvent(undefined);
            setIsModalOpen(true);
          }}
          events={events}
          onEventSelect={(event) => {
            setEditingEvent(event);
            setIsModalOpen(true);
          }}
        />

        <KeyboardHints
          isVisible={showHints}
          onClose={() => setShowHints(false)}
          isVimMode={isVimMode}
        />

        {editingEvent && (
          <div className="fixed bottom-6 right-6">
            <button
              onClick={() => handleDeleteEvent(editingEvent.id)}
              className="brutalist-button bg-destructive text-destructive-foreground flex items-center gap-2" style={{padding: 'var(--space-md) var(--space-xl)'}}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Event
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
