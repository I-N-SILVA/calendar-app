'use client';

import { CalendarEvent, DEFAULT_CATEGORIES } from '@/types/event';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  onDateChange: (date: Date) => void;
}

export default function MonthView({ 
  currentDate, 
  events, 
  onEventClick, 
  onDateClick,
  onDateChange 
}: MonthViewProps) {
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
    return date.toLocaleDateString('en-US', { 
      year: 'numeric',
      month: 'long'
    });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getEventsForDate = (date: Date) => {
    return events.filter(event => 
      event.date.toDateString() === date.toDateString()
    ).slice(0, 3); // Limit to 3 events to prevent overflow
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

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = getDaysArray();

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {formatMonth(currentDate)}
          </h2>
          <p className="text-gray-600 mt-1">Monthly overview</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigateMonth('prev')}
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
            onClick={() => navigateMonth('next')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center gap-2"
          >
            Next
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl overflow-hidden p-1">
        {/* Weekday headers */}
        {weekdays.map((day) => (
          <div key={day} className="bg-gradient-to-br from-slate-50 to-slate-100 p-4 font-bold text-center text-gray-800 rounded-xl">
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map(({ date, isCurrentMonth }, index) => {
          const dayEvents = getEventsForDate(date);
          const today = isToday(date);
          
          return (
            <div
              key={index}
              className={`p-2 min-h-[120px] rounded-xl cursor-pointer transition-all duration-200 ${
                !isCurrentMonth
                  ? 'bg-gray-50 text-gray-400'
                  : today
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 hover:shadow-md'
              }`}
              onClick={() => onDateClick?.(date)}
            >
              <div className={`text-sm font-semibold mb-1 ${
                today ? 'text-white' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {date.getDate()}
                {today && <div className="text-xs opacity-90">Today</div>}
              </div>
              
              <div className="space-y-1">
                {dayEvents.map((event) => {
                  const category = DEFAULT_CATEGORIES.find(cat => cat.id === event.categoryId) || DEFAULT_CATEGORIES[0];
                  
                  return (
                    <div
                      key={event.id}
                      className={`text-xs p-1 rounded truncate cursor-pointer transition-all hover:shadow-sm ${
                        !isCurrentMonth ? 'opacity-50' : ''
                      } ${
                        today 
                          ? 'bg-white bg-opacity-20 text-white hover:bg-opacity-30' 
                          : `bg-gradient-to-r ${category.color} text-white hover:shadow-md`
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick?.(event);
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <span className="text-xs">{category.icon}</span>
                        <span className="truncate">{event.title}</span>
                      </div>
                    </div>
                  );
                })}
                {dayEvents.length === 0 && isCurrentMonth && (
                  <div className="opacity-0 hover:opacity-100 transition-opacity">
                    <div className={`text-xs p-1 rounded ${
                      today ? 'text-white opacity-70' : 'text-gray-400'
                    }`}>
                      + Add
                    </div>
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