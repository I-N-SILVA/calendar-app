'use client';

import { useState, useEffect } from 'react';
import { CalendarEvent, DEFAULT_CATEGORIES, RecurrenceRule } from '@/types/event';
import RecurrenceSelector from '@/components/RecurrenceSelector';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  selectedDate?: Date;
  selectedHour?: number;
  editingEvent?: CalendarEvent;
}

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  selectedDate,
  selectedHour,
  editingEvent
}: EventModalProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('work');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState<RecurrenceRule | undefined>();

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title);
      setDate(editingEvent.date.toISOString().split('T')[0]);
      setStartTime(editingEvent.startTime);
      setEndTime(editingEvent.endTime);
      setDescription(editingEvent.description || '');
      setCategoryId(editingEvent.categoryId || 'work');
      setIsRecurring(editingEvent.isRecurring || false);
      setRecurrence(editingEvent.recurrence);
    } else if (selectedDate) {
      setDate(selectedDate.toISOString().split('T')[0]);
      if (selectedHour !== undefined) {
        const timeString = selectedHour.toString().padStart(2, '0') + ':00';
        setStartTime(timeString);
        const endHour = (selectedHour + 1) % 24;
        setEndTime(endHour.toString().padStart(2, '0') + ':00');
      }
    }
  }, [editingEvent, selectedDate, selectedHour]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !startTime || !endTime) return;

    const eventDate = new Date(date);
    onSave({
      title,
      date: eventDate,
      startTime,
      endTime,
      description,
      categoryId,
      isRecurring,
      recurrence
    });

    setTitle('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setDescription('');
    setCategoryId('work');
    setIsRecurring(false);
    setRecurrence(undefined);
    onClose();
  };

  const handleClose = () => {
    setTitle('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setDescription('');
    setCategoryId('work');
    setIsRecurring(false);
    setRecurrence(undefined);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 w-full max-w-lg transform transition-all max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 mr-4">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
              {editingEvent ? 'Edit Event' : 'Create New Event'}
            </h3>
            <p className="text-xs sm:text-sm text-gray-600">
              {editingEvent ? 'Update your event details' : 'Add a new event to your calendar'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
              📝 Event Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-500"
              placeholder="Enter event title"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-semibold text-gray-900 mb-2">
              🏷️ Category *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DEFAULT_CATEGORIES.map((category) => (
                <label
                  key={category.id}
                  className={`flex items-center gap-2 p-2 sm:p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    categoryId === category.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="category"
                    value={category.id}
                    checked={categoryId === category.id}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-base sm:text-lg">{category.icon}</span>
                  <span className="text-sm font-medium text-gray-900">{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-semibold text-gray-900 mb-2">
              📅 Date *
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-semibold text-gray-900 mb-2">
                🕐 Start Time *
              </label>
              <input
                type="time"
                id="startTime"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-semibold text-gray-900 mb-2">
                🕐 End Time *
              </label>
              <input
                type="time"
                id="endTime"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
              📄 Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder-gray-500 resize-none"
              placeholder="Enter event description (optional)"
              rows={3}
            />
          </div>

          <div>
            <RecurrenceSelector
              recurrence={recurrence}
              isRecurring={isRecurring}
              onRecurrenceChange={(newRecurrence, newIsRecurring) => {
                setRecurrence(newRecurrence);
                setIsRecurring(newIsRecurring);
              }}
            />
          </div>

          <div className="flex gap-3 pt-6">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {editingEvent ? '✨ Update Event' : '🎉 Create Event'}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 px-6 rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}