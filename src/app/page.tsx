'use client';

import { useState } from 'react';
import Calendar from '@/components/Calendar';
import DayView from '@/components/DayView';
import MonthView from '@/components/MonthView';
import ViewSelector, { ViewMode } from '@/components/ViewSelector';
import SearchAndFilter from '@/components/SearchAndFilter';
import ThemeToggle from '@/components/ThemeToggle';
import EventModal from '@/components/EventModal';
import { useEvents } from '@/hooks/useEvents';
import { CalendarEvent } from '@/types/event';

export default function Home() {
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedHour, setSelectedHour] = useState<number>();
  const [editingEvent, setEditingEvent] = useState<CalendarEvent>();
  const [currentView, setCurrentView] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [showSearch, setShowSearch] = useState(false);

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900 p-3 sm:p-6 transition-colors duration-200">
      <div className="max-w-7xl mx-auto">
        {/* Theme Toggle - Fixed Position */}
        <div className="fixed top-6 right-6 z-50">
          <ThemeToggle />
        </div>
        <div className="mb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              📅 My Calendar
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-base sm:text-lg transition-colors duration-200">
              Organize your schedule with style and ease
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mb-8">
            <ViewSelector 
              currentView={currentView} 
              onViewChange={setCurrentView} 
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className={`px-4 sm:px-6 py-3 sm:py-4 rounded-2xl transition-all duration-200 font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center gap-2 text-base sm:text-lg ${
                  showSearch
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                    : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700'
                }`}
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden sm:inline">Search</span>
              </button>
              <button
                onClick={() => {
                  setSelectedDate(new Date());
                  setSelectedHour(new Date().getHours());
                  setEditingEvent(undefined);
                  setIsModalOpen(true);
                }}
                className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center gap-3 text-base sm:text-lg w-full sm:w-auto justify-center"
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
          <SearchAndFilter
            events={events}
            onFilteredEventsChange={setFilteredEvents}
          />
        )}

        {currentView === 'week' && (
          <Calendar
            events={showSearch && filteredEvents.length >= 0 ? filteredEvents : events}
            onEventClick={handleEventClick}
            onTimeSlotClick={handleTimeSlotClick}
            onEventMove={handleEventMove}
          />
        )}

        {currentView === 'day' && (
          <DayView
            selectedDate={currentDate}
            events={showSearch && filteredEvents.length >= 0 ? filteredEvents : events}
            onEventClick={handleEventClick}
            onTimeSlotClick={handleTimeSlotClick}
            onDateChange={setCurrentDate}
          />
        )}

        {currentView === 'month' && (
          <MonthView
            currentDate={currentDate}
            events={showSearch && filteredEvents.length >= 0 ? filteredEvents : events}
            onEventClick={handleEventClick}
            onDateClick={handleDateClick}
            onDateChange={setCurrentDate}
          />
        )}

        <EventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveEvent}
          selectedDate={selectedDate}
          selectedHour={selectedHour}
          editingEvent={editingEvent}
        />

        {editingEvent && (
          <div className="fixed bottom-6 right-6">
            <button
              onClick={() => handleDeleteEvent(editingEvent.id)}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-bold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center gap-2"
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
