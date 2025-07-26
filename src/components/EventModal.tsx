'use client';

import { useState, useEffect } from 'react';
import { CalendarEvent, DEFAULT_CATEGORIES, RecurrenceRule } from '@/types/event';
import RecurrenceSelector from '@/components/RecurrenceSelector';
import TimeBarPicker from '@/components/TimeBarPicker';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  onDelete?: (eventId: string) => void;
  selectedDate?: Date;
  selectedHour?: number;
  editingEvent?: CalendarEvent;
}

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  selectedDate,
  selectedHour,
  editingEvent
}: EventModalProps) {
  // Helper function to calculate duration
  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return null;
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const duration = endMinutes - startMinutes;
    if (duration <= 0) return null;
    
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return {
      duration,
      text: `${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m` : ''}`,
      percentage: Math.min(100, Math.max(0, (duration / 480) * 100)) // 8 hours = 100%
    };
  };
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
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-card shadow-2xl w-full max-w-2xl transform transition-all max-h-[90vh] overflow-y-auto border border-border spacing-mathematical">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1 mr-4">
            <h3 className="text-xl sm:text-2xl font-bold text-card-foreground mb-1">
              {editingEvent ? 'Edit Event' : 'Create New Event'}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {editingEvent ? 'Update your event details' : 'Add a new event to your calendar'}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground hover:bg-muted p-2 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="brutalist-form">
          <div className="brutalist-form-group stagger-animation stagger-delay-1">
            <label htmlFor="title" className="brutalist-form-label">
              [TITLE] *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="brutalist-form-input w-full"
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="brutalist-form-group stagger-animation stagger-delay-2">
            <label htmlFor="category" className="brutalist-form-label">
              [CATEGORY] *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2" style={{gap: 'var(--space-sm)'}}>
              {DEFAULT_CATEGORIES.map((category) => (
                <label
                  key={category.id}
                  className={`flex items-center gap-2 p-2 sm:p-3 border-2 cursor-pointer transition-all font-mono ${
                    categoryId === category.id
                      ? 'border-primary bg-primary text-primary-foreground font-bold'
                      : 'border-border hover:border-foreground hover:bg-muted text-card-foreground'
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
                  <span className="text-sm font-medium text-card-foreground">{category.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="brutalist-form-group stagger-animation stagger-delay-3">
            <label htmlFor="date" className="brutalist-form-label">
              [DATE] *
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="brutalist-form-input w-full"
              required
            />
          </div>

          <div className="stagger-animation stagger-delay-4" style={{display: 'grid', gap: 'var(--space-2xl)'}}>
            <TimeBarPicker
              value={startTime}
              onChange={setStartTime}
              label="START"
              onDurationSelect={(minutes) => {
                if (startTime) {
                  const [hour, min] = startTime.split(':').map(Number);
                  const startMinutes = hour * 60 + min;
                  const endMinutes = startMinutes + minutes;
                  const endHour = Math.floor(endMinutes / 60) % 24;
                  const endMin = endMinutes % 60;
                  setEndTime(`${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`);
                }
              }}
            />
            <TimeBarPicker
              value={endTime}
              onChange={setEndTime}
              label="END"
            />
          </div>
          
          {/* Duration Display */}
          {startTime && endTime && (
            <div className="bg-muted/50 border-2 border-border spacing-mathematical">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Event Duration:</span>
                <span className="text-sm font-semibold text-foreground">
                  {calculateDuration(startTime, endTime)?.text || '[INVALID]'}
                </span>
              </div>
              <div className="mt-3 bg-primary/20 h-3 overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-300"
                  style={{
                    width: `${calculateDuration(startTime, endTime)?.percentage || 0}%`
                  }}
                />
              </div>
            </div>
          )}

          <div className="brutalist-form-group stagger-animation stagger-delay-5">
            <label htmlFor="description" className="brutalist-form-label">
              [DESCRIPTION]
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="brutalist-form-input w-full resize-none"
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

          <div className="flex" style={{gap: 'var(--space-md)', paddingTop: 'var(--space-xl)'}}>
            <button
              type="submit"
              className="flex-1 bg-primary text-primary-foreground hover:opacity-90 transition-all duration-200 font-bold font-mono uppercase tracking-wider shadow-lg hover:shadow-xl" style={{padding: 'var(--space-lg) var(--space-xl)'}}
            >
              {editingEvent ? '[UPDATE]' : '[CREATE]'}
            </button>
            {editingEvent && onDelete && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Delete "${editingEvent.title}"?`)) {
                    onDelete(editingEvent.id);
                  }
                }}
                className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/80 transition-all duration-200 font-bold font-mono uppercase tracking-wider border-2 border-destructive" style={{padding: 'var(--space-lg) var(--space-xl)'}}
              >
                [DELETE]
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-muted text-muted-foreground hover:bg-muted-foreground hover:text-background transition-all duration-200 font-bold font-mono uppercase tracking-wider" style={{padding: 'var(--space-lg) var(--space-xl)'}}
            >
              [CANCEL]
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}