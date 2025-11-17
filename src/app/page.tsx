'use client';

import { useState, useEffect } from 'react';
import Calendar from '@/components/Calendar';
import DayView from '@/components/DayView';
import MonthView from '@/components/MonthView';
import ViewSelector, { ViewMode } from '@/components/ViewSelector';
import SearchAndFilter from '@/components/SearchAndFilter';
import ThemeToggle from '@/components/ThemeToggle';
import EventModalEnhanced from '@/components/EventModalEnhanced';
import CommandPalette from '@/components/CommandPalette';
import ExportImportPanel from '@/components/ExportImportPanel';
import SettingsPanel from '@/components/SettingsPanel';
import ConfirmDialog from '@/components/ConfirmDialog';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import { useEvents } from '@/hooks/useEvents';
import { useCommandPalette } from '@/hooks/useCommandPalette';
import { useRippleEffect } from '@/hooks/useRippleEffect';
import { useVimNavigation } from '@/hooks/useVimNavigation';
import { useToast } from '@/contexts/ToastContext';
import { useSettings } from '@/contexts/SettingsContext';
import { useCalendarNavigation } from '@/contexts/CalendarNavigationContext';
import { CalendarEvent } from '@/types/event';
import KeyboardHints from '@/components/KeyboardHints';
import TimeAnalytics from '@/components/TimeAnalytics';
import { requestNotificationPermission, showNotification, setupReminderInterval } from '@/utils/notifications';

export default function Home() {
  const { events, baseEvents, isLoading, addEvent, updateEvent, deleteEvent, importEvents } = useEvents();
  const { isOpen: isCommandPaletteOpen, openPalette, closePalette } = useCommandPalette();
  const { showToast } = useToast();
  const { settings, updateSettings } = useSettings();
  const navigation = useCalendarNavigation();
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
  const [showExportImport, setShowExportImport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });

  // Sync navigation selection with view changes
  useEffect(() => {
    if (navigation.selection) {
      navigation.setSelection({ ...navigation.selection, view: currentView });
    }
  }, [currentView]); // eslint-disable-line react-hooks/exhaustive-deps

  // Vim navigation setup with calendar navigation integration
  const { isVimMode, showHints, setShowHints } = useVimNavigation({
    enabled: true,
    onMoveUp: () => {
      navigation.moveUp();
    },
    onMoveDown: () => {
      navigation.moveDown();
    },
    onMoveLeft: () => {
      navigation.moveLeft();
    },
    onMoveRight: () => {
      navigation.moveRight();
    },
    onSelect: () => {
      if (navigation.selection) {
        setSelectedDate(navigation.selection.date);
        setSelectedHour(navigation.selection.hour);
        setEditingEvent(undefined);
        setIsModalOpen(true);
      } else {
        setSelectedDate(new Date());
        setSelectedHour(new Date().getHours());
        setEditingEvent(undefined);
        setIsModalOpen(true);
      }
    },
    onEscape: () => {
      setIsModalOpen(false);
    }
  });

  // Setup notifications
  useEffect(() => {
    if (settings.notificationsEnabled) {
      requestNotificationPermission().then(granted => {
        if (!granted) {
          showToast('Please enable notifications in your browser settings', 'warning');
          updateSettings({ notificationsEnabled: false });
        }
      });

      // Setup reminder checking
      const cleanup = setupReminderInterval(events, (event) => {
        showNotification(
          `Upcoming Event: ${event.title}`,
          `Starting at ${event.startTime} - ${event.description || 'No description'}`
        );
        showToast(`Reminder: ${event.title} starts at ${event.startTime}`, 'info', 10000);
      }, 60000);

      return cleanup;
    }
  }, [settings.notificationsEnabled, events, showToast, updateSettings]);

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

  const handleSaveEvent = (eventData: Omit<CalendarEvent, 'id'>, editAll?: boolean) => {
    try {
      if (editingEvent) {
        // Handle recurring event updates
        if (editAll && editingEvent.originalEventId) {
          // Update the base recurring event
          updateEvent(editingEvent.originalEventId, eventData);
          showToast('All occurrences updated successfully', 'success');
        } else if (editingEvent.originalEventId && !editAll) {
          // Create an exception for this occurrence
          // For now, we'll just create a new event
          addEvent({ ...eventData, isRecurring: false });
          showToast('This occurrence updated (created as new event)', 'success');
        } else {
          updateEvent(editingEvent.id, eventData);
          showToast('Event updated successfully', 'success');
        }
      } else {
        addEvent(eventData);
        showToast('Event created successfully', 'success');
      }
    } catch (error) {
      showToast('Failed to save event: ' + (error as Error).message, 'error');
    }
  };

  const handleDeleteEvent = (eventId: string, deleteAll?: boolean) => {
    try {
      deleteEvent(eventId);
      setIsModalOpen(false);
      showToast(deleteAll ? 'All occurrences deleted' : 'Event deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete event', 'error');
    }
  };

  const handleDuplicateEvent = (eventToDuplicate: CalendarEvent) => {
    const { id, ...eventWithoutId } = eventToDuplicate;
    const duplicatedEvent = {
      ...eventWithoutId,
      title: `${eventToDuplicate.title} (Copy)`,
      date: new Date(eventToDuplicate.date.getTime() + 24 * 60 * 60 * 1000), // Next day
      isRecurring: false, // Don't duplicate recurrence
    };
    try {
      addEvent(duplicatedEvent);
      showToast('Event duplicated successfully', 'success');
    } catch (error) {
      showToast('Failed to duplicate event', 'error');
    }
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
    try {
      updateEvent(eventId, {
        ...event,
        date: newDate,
        startTime: newStartTime,
        endTime: newEndTime
      });
      showToast('Event rescheduled successfully', 'success');
    } catch (error) {
      showToast('Failed to move event', 'error');
    }
  };

  const handleImport = (importedEvents: CalendarEvent[]) => {
    try {
      importEvents(importedEvents);
      setShowExportImport(false);
    } catch (error) {
      showToast('Failed to import events', 'error');
    }
  };

  const displayedEvents = showSearch && filteredEvents.length >= 0 ? filteredEvents : events;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner message="Loading Calendar" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6 transition-colors duration-200 crt-effect">
      <div className="max-w-7xl mx-auto">
        {/* Theme Toggle - Fixed Position */}
        <div className="fixed top-6 left-6 z-40">
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
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={(e) => {
                  createRipple(e);
                  openPalette();
                }}
                className="brutalist-button bg-accent text-accent-foreground flex items-center gap-2 text-base sm:text-lg font-semibold ripple-effect"
                style={{padding: 'var(--space-md) var(--space-xl)'}}
                title="Command Palette (Cmd+K)"
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
                }`}
                style={{padding: 'var(--space-md) var(--space-xl)'}}
                title="Time Analytics"
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
                }`}
                style={{padding: 'var(--space-md) var(--space-xl)'}}
                title="Search & Filter"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden sm:inline">Search</span>
              </button>
              <button
                onClick={(e) => {
                  createRipple(e);
                  setShowExportImport(true);
                }}
                className="brutalist-button bg-chart-4 text-background flex items-center gap-2 text-base sm:text-lg font-semibold ripple-effect"
                style={{padding: 'var(--space-md) var(--space-xl)'}}
                title="Export & Import"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="hidden sm:inline">[SYNC]</span>
              </button>
              <button
                onClick={(e) => {
                  createRipple(e);
                  setShowSettings(true);
                }}
                className="brutalist-button bg-muted text-muted-foreground flex items-center gap-2 text-base sm:text-lg font-semibold ripple-effect"
                style={{padding: 'var(--space-md) var(--space-xl)'}}
                title="Settings"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  createRipple(e);
                  setSelectedDate(new Date());
                  setSelectedHour(new Date().getHours());
                  setEditingEvent(undefined);
                  setIsModalOpen(true);
                }}
                className="brutalist-button bg-primary text-primary-foreground flex items-center gap-3 text-base sm:text-lg font-semibold w-full sm:w-auto justify-center ripple-effect"
                style={{padding: 'var(--space-md) var(--space-xl)'}}
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
            <TimeAnalytics events={displayedEvents} />
          </>
        )}

        {/* ASCII Section Divider */}
        <div className="ascii-divider text-xs my-12">
          ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
        </div>

        {/* Show empty state if no events */}
        {displayedEvents.length === 0 && !showSearch ? (
          <EmptyState
            title="NO_EVENTS"
            message="You haven't created any events yet. Click the button below to get started."
            action={{
              label: "Create First Event",
              onClick: () => {
                setSelectedDate(new Date());
                setSelectedHour(new Date().getHours());
                setEditingEvent(undefined);
                setIsModalOpen(true);
              }
            }}
          />
        ) : (
          <>
            <div className="transition-all duration-300 ease-in-out">
              {currentView === 'week' && (
                <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
                  <Calendar
                    events={displayedEvents}
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
                    events={displayedEvents}
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
                    events={displayedEvents}
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
          </>
        )}

        <EventModalEnhanced
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          selectedDate={selectedDate}
          selectedHour={selectedHour}
          editingEvent={editingEvent}
          allEvents={events}
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

        {showExportImport && (
          <ExportImportPanel
            events={baseEvents}
            onImport={handleImport}
            onClose={() => setShowExportImport(false)}
          />
        )}

        {showSettings && (
          <SettingsPanel onClose={() => setShowSettings(false)} />
        )}

        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          onConfirm={() => {
            confirmDialog.onConfirm();
            setConfirmDialog({ ...confirmDialog, isOpen: false });
          }}
          onCancel={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        />
      </div>
    </div>
  );
}
