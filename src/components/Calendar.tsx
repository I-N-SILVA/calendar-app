'use client';

import { useState, useEffect } from 'react';
import { CalendarEvent, DEFAULT_CATEGORIES } from '@/types/event';

interface CalendarProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onTimeSlotClick?: (date: Date, hour: number) => void;
}

export default function Calendar({ events, onEventClick, onTimeSlotClick }: CalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());

  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    setCurrentWeekStart(startOfWeek);
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

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 border border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <div className="text-center sm:text-left">
          <h2 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Week of {formatDate(currentWeekStart)}
          </h2>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Click on any time slot to create an event</p>
        </div>
        <div className="flex gap-2 sm:gap-3 justify-center">
          <button
            onClick={() => navigateWeek('prev')}
            className="px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
          >
            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Previous</span>
            <span className="sm:hidden">Prev</span>
          </button>
          <button
            onClick={() => setCurrentWeekStart(new Date())}
            className="px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base"
          >
            Today
          </button>
          <button
            onClick={() => navigateWeek('next')}
            className="px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-1 sm:gap-2 text-sm sm:text-base"
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
        <div className="grid grid-cols-8 gap-1 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl overflow-hidden p-1 min-w-[800px]">
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-2 sm:p-4 font-bold text-center text-gray-800 rounded-xl">
            <span className="hidden sm:inline">⏰ Time</span>
            <span className="sm:hidden">⏰</span>
          </div>
          {weekDays.map((day, index) => (
            <div key={index} className={`p-2 sm:p-4 font-bold text-center rounded-xl transition-all ${
              isToday(day) 
                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg' 
                : 'bg-gradient-to-br from-slate-50 to-slate-100 text-gray-800 hover:from-blue-50 hover:to-purple-50'
            }`}>
              <div className="text-xs sm:text-sm">{formatDate(day)}</div>
              {isToday(day) && <div className="text-xs mt-1 opacity-90">Today</div>}
            </div>
          ))}

        {hours.map(hour => {
          const timeString = hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
          const isCurrentTime = isCurrentHour(hour) && weekDays.some(day => isToday(day));
          
          return (
            <div key={hour} className="contents">
              <div className={`p-2 sm:p-4 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                isCurrentTime 
                  ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 shadow-md' 
                  : 'bg-gradient-to-br from-slate-50 to-slate-100 text-gray-700'
              }`}>
                <div className="truncate">{timeString}</div>
                {isCurrentTime && <div className="text-xs opacity-75 mt-1">Now</div>}
              </div>
              {weekDays.map((day, dayIndex) => {
                const dayEvents = getEventsForDay(day).filter(event => {
                  const eventHour = parseInt(event.startTime.split(':')[0]);
                  return eventHour === hour;
                });
                
                const isTodaySlot = isToday(day);
                const isCurrentSlot = isTodaySlot && isCurrentHour(hour);

                return (
                  <div
                    key={`${hour}-${dayIndex}`}
                    className={`p-2 min-h-[70px] cursor-pointer transition-all duration-200 relative rounded-xl ${
                      isCurrentSlot
                        ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 shadow-md'
                        : isTodaySlot
                        ? 'bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border border-blue-200'
                        : 'bg-white hover:bg-gradient-to-br hover:from-gray-50 hover:to-slate-50 border border-gray-200'
                    } hover:shadow-lg hover:scale-[1.02]`}
                    onClick={() => onTimeSlotClick?.(day, hour)}
                  >
                    {dayEvents.map(event => {
                      const category = DEFAULT_CATEGORIES.find(cat => cat.id === event.categoryId) || DEFAULT_CATEGORIES[0];
                      
                      return (
                        <div
                          key={event.id}
                          className={`bg-gradient-to-r ${category.color} text-white rounded-lg p-2 mb-1 text-xs cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onEventClick?.(event);
                          }}
                        >
                          <div className="flex items-center gap-1 mb-1">
                            <span>{category.icon}</span>
                            <span className="font-semibold truncate">{event.title}</span>
                          </div>
                          <div className="opacity-90 text-xs">{event.startTime} - {event.endTime}</div>
                        </div>
                      );
                    })}
                    {dayEvents.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div className="text-gray-400 text-xs font-medium">+ Add Event</div>
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
    </div>
  );
}