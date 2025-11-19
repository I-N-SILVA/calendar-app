'use client';

import { useState, useEffect } from 'react';
import Calendar from '@/components/Calendar';
import DayView from '@/components/DayView';
import MonthView from '@/components/MonthView';
import ViewSelector, { ViewMode } from '@/components/ViewSelector';
import SearchAndFilter from '@/components/SearchAndFilter';
import ThemeToggle from '@/components/ThemeToggle';
import EventModal from '@/components/EventModal';
import CommandPalette from '@/components/CommandPalette';
import ExportImportPanel from '@/components/ExportImportPanel';
import SettingsPanel from '@/components/SettingsPanel';
import ConfirmDialog from '@/components/ConfirmDialog';
import LoadingSpinner from '@/components/LoadingSpinner';
import EmptyState from '@/components/EmptyState';
import Sidebar from '@/components/Sidebar';
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
import QuickAdd from '@/components/QuickAdd';
import TemplatePanel from '@/components/TemplatePanel';
import AgendaView from '@/components/AgendaView';
import KeyboardShortcutsPanel from '@/components/KeyboardShortcutsPanel';
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
  const [showTemplates, setShowTemplates] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [prefillEventData, setPrefillEventData] = useState<Partial<Omit<CalendarEvent, 'id'>> | undefined>();
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

  // Global keyboard shortcuts
  useEffect(() => {
    const handleGlobalKeyboard = (e: KeyboardEvent) => {
      // Don't trigger if typing in input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Show keyboard shortcuts
      if (e.key === '?') {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }

      // View switching
      if (e.key === '1') { e.preventDefault(); setCurrentView('day'); }
      if (e.key === '2') { e.preventDefault(); setCurrentView('week'); }
      if (e.key === '3') { e.preventDefault(); setCurrentView('month'); }
      if (e.key === '4') { e.preventDefault(); setCurrentView('agenda'); }

      // Quick actions
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setSelectedDate(new Date());
        setSelectedHour(new Date().getHours());
        setEditingEvent(undefined);
        setPrefillEventData(undefined);
        setIsModalOpen(true);
      }

      if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setShowTemplates(true);
      }

      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setShowSearch(!showSearch);
      }

      if (e.key === 'g' || e.key === 'G') {
        e.preventDefault();
        setCurrentDate(new Date());
      }
    };

    window.addEventListener('keydown', handleGlobalKeyboard);
    return () => window.removeEventListener('keydown', handleGlobalKeyboard);
  }, [currentView, showSearch]);

  const handleQuickAddEvent = (event: Omit<CalendarEvent, 'id'>) => {
    addEvent(event);
    showToast('Event created successfully!', 'success');
  };

  const handleOpenFullModal = (prefill?: Partial<Omit<CalendarEvent, 'id'>>) => {
    setPrefillEventData(prefill);
    setSelectedDate(prefill?.date);
    setIsModalOpen(true);
  };

  const handleTemplateSelect = (event: Omit<CalendarEvent, 'id'>) => {
    setPrefillEventData(event);
    setIsModalOpen(true);
  };

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
    <div className="min-h-screen bg-background transition-colors duration-200 crt-effect">
      {/* Sidebar Navigation */}
      <Sidebar
        onCreateEvent={() => {
          setSelectedDate(new Date());
          setSelectedHour(new Date().getHours());
          setEditingEvent(undefined);
          setPrefillEventData(undefined);
          setIsModalOpen(true);
        }}
        onOpenCommandPalette={openPalette}
        onToggleAnalytics={() => setShowAnalytics(!showAnalytics)}
        onToggleSearch={() => setShowSearch(!showSearch)}
        onOpenExportImport={() => setShowExportImport(true)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenTemplates={() => setShowTemplates(true)}
        onOpenKeyboardShortcuts={() => setShowKeyboardShortcuts(true)}
        showAnalytics={showAnalytics}
        showSearch={showSearch}
      />

      {/* Theme Toggle - Fixed Position */}
      <div className="fixed top-6 right-6 z-40">
        <ThemeToggle />
      </div>

      {/* Main Content Area */}
      <main className="md:ml-64 pb-20 md:pb-0 p-3 sm:p-6 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
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
            <div className="ascii-divider text-sm mb-8">
              ≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡≡
            </div>

            {/* Quick Add Bar */}
            <div className="mb-8">
              <QuickAdd
                onAddEvent={handleQuickAddEvent}
                onOpenFullModal={handleOpenFullModal}
              />
            </div>

            {/* View Selector */}
            <div className="flex justify-center mb-12">
              <ViewSelector
                currentView={currentView}
                onViewChange={setCurrentView}
              />
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

            <div className="transition-all duration-300 ease-in-out">
              {currentView === 'agenda' && (
                <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
                  <AgendaView
                    events={displayedEvents}
                    onEventClick={handleEventClick}
                    onEventDelete={handleDeleteEvent}
                    onEventDuplicate={handleDuplicateEvent}
                  />
                </div>
              )}
            </div>
          </>
        )}

        <EventModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setPrefillEventData(undefined);
          }}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          selectedDate={prefillEventData?.date || selectedDate}
          selectedHour={selectedHour}
          editingEvent={editingEvent}
          prefillData={prefillEventData}
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

        {/* New Feature Panels */}
        <TemplatePanel
          isOpen={showTemplates}
          onClose={() => setShowTemplates(false)}
          onSelectTemplate={handleTemplateSelect}
          selectedDate={selectedDate}
        />

        <KeyboardShortcutsPanel
          isOpen={showKeyboardShortcuts}
          onClose={() => setShowKeyboardShortcuts(false)}
        />
        </div>
      </main>
    </div>
  );
}
