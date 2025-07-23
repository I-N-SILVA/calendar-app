'use client';

import { CalendarEvent, DEFAULT_CATEGORIES } from '@/types/event';

interface DayViewProps {
  selectedDate: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
  onDateChange: (date: Date) => void;
}

export default function DayView({ 
  selectedDate, 
  events, 
  onEventClick, 
  onTimeSlotClick,
  onDateChange 
}: DayViewProps) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
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

  const getEventsForHour = (hour: number) => {
    return events.filter(event => {
      if (event.date.toDateString() !== selectedDate.toDateString()) return false;
      const eventHour = parseInt(event.startTime.split(':')[0]);
      return eventHour === hour;
    });
  };

  const isToday = selectedDate.toDateString() === new Date().toDateString();

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {formatDate(selectedDate)}
          </h2>
          <p className="text-gray-600 mt-1">
            {isToday ? 'Today\'s Schedule' : 'Daily Schedule'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigateDay('prev')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
          <button
            onClick={() => onDateChange(new Date())}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Today
          </button>
          <button
            onClick={() => navigateDay('next')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            Next
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-1 max-h-[600px] overflow-y-auto">
        {hours.map(hour => {
          const hourEvents = getEventsForHour(hour);
          const timeString = hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
          const isCurrentTime = isCurrentHour(hour);
          
          return (
            <div key={hour} className="flex">
              <div className={`w-24 p-4 text-sm font-semibold rounded-l-xl transition-all ${
                isCurrentTime 
                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800' 
                  : 'bg-gradient-to-br from-slate-50 to-slate-100 text-gray-700'
              }`}>
                <div>{timeString}</div>
                {isCurrentTime && <div className="text-xs opacity-75 mt-1">Now</div>}
              </div>
              <div
                className={`flex-1 p-4 min-h-[80px] cursor-pointer transition-all duration-200 rounded-r-xl border-l-2 ${
                  isCurrentTime
                    ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                    : isToday
                    ? 'bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border-blue-200'
                    : 'bg-white hover:bg-gradient-to-br hover:from-gray-50 hover:to-slate-50 border-gray-200'
                } hover:shadow-md`}
                onClick={() => onTimeSlotClick?.(selectedDate, hour)}
              >
                {hourEvents.length === 0 ? (
                  <div className="flex items-center h-full opacity-0 hover:opacity-100 transition-opacity">
                    <span className="text-gray-400 text-sm font-medium">+ Add Event</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {hourEvents.map(event => {
                      const category = DEFAULT_CATEGORIES.find(cat => cat.id === event.categoryId) || DEFAULT_CATEGORIES[0];
                      
                      return (
                        <div
                          key={event.id}
                          className={`bg-gradient-to-r ${category.color} text-white rounded-lg p-3 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick?.(event);
                          }}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-lg">{category.icon}</span>
                            <span className="font-semibold">{event.title}</span>
                          </div>
                          <div className="text-sm opacity-90">
                            {event.startTime} - {event.endTime}
                          </div>
                          {event.description && (
                            <div className="text-sm opacity-80 mt-1 line-clamp-2">
                              {event.description}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}