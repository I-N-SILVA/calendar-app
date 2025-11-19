'use client';

import { useState, useEffect, useMemo } from 'react';
import { CalendarEvent, DEFAULT_CATEGORIES, RecurrenceRule, VoiceMemo } from '@/types/event';
import RecurrenceSelector from '@/components/RecurrenceSelector';
import TimeBarPicker from '@/components/TimeBarPicker';
import ConfirmDialog from '@/components/ConfirmDialog';
import VoiceMemoRecorder from '@/components/VoiceMemoRecorder';
import VoiceMemoPlayer from '@/components/VoiceMemoPlayer';
import { findConflicts, getConflictMessage } from '@/utils/conflicts';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Omit<CalendarEvent, 'id'>, editAll?: boolean) => void;
  onDelete?: (eventId: string, deleteAll?: boolean) => void;
  selectedDate?: Date;
  selectedHour?: number;
  editingEvent?: CalendarEvent;
  prefillData?: Partial<Omit<CalendarEvent, 'id'>>;
  allEvents: CalendarEvent[];
}

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  selectedDate,
  selectedHour,
  editingEvent,
  prefillData,
  allEvents
}: EventModalProps) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('work');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrence, setRecurrence] = useState<RecurrenceRule | undefined>();
  const [showRecurringOptions, setShowRecurringOptions] = useState(false);
  const [showDeleteOptions, setShowDeleteOptions] = useState(false);
  const [showConflictWarning, setShowConflictWarning] = useState(false);
  const [showDurationWarning, setShowDurationWarning] = useState(false);
  const [_pendingAction, setPendingAction] = useState<'save' | 'delete' | null>(null);
  const [voiceMemos, setVoiceMemos] = useState<VoiceMemo[]>([]);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);

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
      text: `${hours > 0 ? `${hours}h ` : ''}${minutes > 0 ? `${minutes}m` : ''}`.trim() || '0m',
      percentage: Math.min(100, Math.max(0, (duration / 480) * 100)) // 8 hours = 100%
    };
  };

  // Check for conflicts
  const conflicts = useMemo(() => {
    if (!date || !startTime || !endTime || !title) return [];

    const tempEvent: CalendarEvent = {
      id: editingEvent?.id || 'temp',
      title,
      date: new Date(date),
      startTime,
      endTime,
      categoryId,
      description,
      isRecurring,
      recurrence
    };

    return findConflicts(tempEvent, allEvents);
  }, [date, startTime, endTime, title, categoryId, description, isRecurring, recurrence, allEvents, editingEvent]);

  const isRecurringEvent = editingEvent?.isRecurring || editingEvent?.originalEventId;

  useEffect(() => {
    if (editingEvent) {
      // Editing existing event - populate all fields
      setTitle(editingEvent.title);
      setDate(editingEvent.date.toISOString().split('T')[0]);
      setStartTime(editingEvent.startTime);
      setEndTime(editingEvent.endTime);
      setDescription(editingEvent.description || '');
      setCategoryId(editingEvent.categoryId || 'work');
      setIsRecurring(editingEvent.isRecurring || false);
      setRecurrence(editingEvent.recurrence);
      setVoiceMemos(editingEvent.voiceMemos || []);
    } else if (prefillData) {
      // Template or prefill data - auto-fill all provided fields
      setTitle(prefillData.title || '');
      setDate(prefillData.date ? prefillData.date.toISOString().split('T')[0] : selectedDate?.toISOString().split('T')[0] || '');
      setStartTime(prefillData.startTime || '');
      setEndTime(prefillData.endTime || '');
      setDescription(prefillData.description || '');
      setCategoryId(prefillData.categoryId || 'work');
      setIsRecurring(prefillData.isRecurring || false);
      setRecurrence(prefillData.recurrence);
      setVoiceMemos(prefillData.voiceMemos || []);
    } else if (selectedDate) {
      // New event from time slot click
      setDate(selectedDate.toISOString().split('T')[0]);
      if (selectedHour !== undefined) {
        const timeString = selectedHour.toString().padStart(2, '0') + ':00';
        setStartTime(timeString);
        const endHour = (selectedHour + 1) % 24;
        setEndTime(endHour.toString().padStart(2, '0') + ':00');
      }
    }
  }, [editingEvent, prefillData, selectedDate, selectedHour]);

  const resetForm = () => {
    setTitle('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setDescription('');
    setCategoryId('work');
    setIsRecurring(false);
    setRecurrence(undefined);
    setVoiceMemos([]);
    setShowVoiceRecorder(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !startTime || !endTime) return;

    // Check for unrealistic duration (>8 hours)
    const duration = calculateDuration(startTime, endTime);
    if (duration && duration.duration > 480) {
      setPendingAction('save');
      setShowDurationWarning(true);
      return;
    }

    // Check for conflicts
    if (conflicts.length > 0) {
      setPendingAction('save');
      setShowConflictWarning(true);
      return;
    }

    // If editing a recurring event, show options
    if (editingEvent && isRecurringEvent) {
      setShowRecurringOptions(true);
      return;
    }

    saveEvent(false);
  };

  const saveEvent = (editAll: boolean) => {
    const eventData = {
      title,
      date: new Date(date),
      startTime,
      endTime,
      description,
      categoryId,
      isRecurring,
      recurrence,
      voiceMemos: voiceMemos.length > 0 ? voiceMemos : undefined
    };

    onSave(eventData, editAll);
    resetForm();
    onClose();
  };

  const handleDelete = () => {
    if (!editingEvent) return;

    if (isRecurringEvent) {
      setShowDeleteOptions(true);
    } else {
      setPendingAction('delete');
      setShowDeleteOptions(true);
    }
  };

  const deleteEvent = (deleteAll: boolean) => {
    if (!editingEvent || !onDelete) return;
    onDelete(editingEvent.id, deleteAll);
    resetForm();
    onClose();
  };

  const handleClose = () => {
    resetForm();
    setShowRecurringOptions(false);
    setShowDeleteOptions(false);
    setShowConflictWarning(false);
    setShowDurationWarning(false);
    setPendingAction(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
        <div className="bg-card shadow-2xl w-full max-w-2xl transform transition-all max-h-[90vh] overflow-y-auto border border-border spacing-mathematical">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1 mr-4">
              <h3 className="text-xl sm:text-2xl font-bold text-card-foreground mb-1 font-mono uppercase tracking-wider">
                {editingEvent ? '[EDIT_EVENT]' : '[CREATE_EVENT]'}
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground font-mono">
                {editingEvent ? 'Update event details' : 'Add new event to calendar'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground hover:bg-muted p-2 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Conflict Warning */}
          {conflicts.length > 0 && (
            <div className="bg-chart-4/10 border-2 border-chart-4 mb-6 spacing-mathematical animate-in slide-in-from-top-2">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-chart-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <div className="font-bold text-chart-4 font-mono mb-1">[CONFLICT_DETECTED]</div>
                  <div className="text-sm font-mono text-chart-4">
                    {getConflictMessage(conflicts)}
                  </div>
                </div>
              </div>
            </div>
          )}

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
                  <span className="text-sm text-muted-foreground font-mono">Duration:</span>
                  <span className="text-sm font-semibold text-foreground font-mono">
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

            {/* Voice Memos Section */}
            <div className="brutalist-form-group stagger-animation stagger-delay-6">
              <label className="brutalist-form-label">
                [VOICE_MEMOS]
              </label>

              {/* Existing Voice Memos */}
              {voiceMemos.length > 0 && (
                <div className="space-y-2 mb-4">
                  {voiceMemos.map((memo, index) => (
                    <VoiceMemoPlayer
                      key={memo.id}
                      memo={memo}
                      onDelete={() => {
                        setVoiceMemos(voiceMemos.filter((_, i) => i !== index));
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Voice Recorder */}
              {showVoiceRecorder ? (
                <VoiceMemoRecorder
                  onSave={(memo) => {
                    setVoiceMemos([...voiceMemos, memo]);
                    setShowVoiceRecorder(false);
                  }}
                  onCancel={() => setShowVoiceRecorder(false)}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setShowVoiceRecorder(true)}
                  className="w-full brutalist-button bg-secondary text-secondary-foreground flex items-center justify-center gap-2"
                  style={{ padding: 'var(--space-md)' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span className="font-mono font-bold uppercase">ADD VOICE MEMO</span>
                </button>
              )}
            </div>

            <div className="flex" style={{gap: 'var(--space-md)', paddingTop: 'var(--space-xl)'}}>
              <button
                type="submit"
                className="flex-1 bg-primary text-primary-foreground hover:opacity-90 transition-all duration-200 font-bold font-mono uppercase tracking-wider shadow-lg hover:shadow-xl"
                style={{padding: 'var(--space-lg) var(--space-xl)'}}
              >
                {editingEvent ? '[UPDATE]' : '[CREATE]'}
              </button>
              {editingEvent && onDelete && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/80 transition-all duration-200 font-bold font-mono uppercase tracking-wider border-2 border-destructive"
                  style={{padding: 'var(--space-lg) var(--space-xl)'}}
                >
                  [DELETE]
                </button>
              )}
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 bg-muted text-muted-foreground hover:bg-muted-foreground hover:text-background transition-all duration-200 font-bold font-mono uppercase tracking-wider"
                style={{padding: 'var(--space-lg) var(--space-xl)'}}
              >
                [CANCEL]
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Recurring Event Save Options */}
      {showRecurringOptions && (
        <ConfirmDialog
          isOpen={true}
          title="Edit Recurring Event"
          message="This is a recurring event. Would you like to edit just this occurrence or all occurrences?"
          confirmText="Edit All"
          cancelText="This Only"
          onConfirm={() => {
            setShowRecurringOptions(false);
            saveEvent(true);
          }}
          onCancel={() => {
            setShowRecurringOptions(false);
            saveEvent(false);
          }}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteOptions && editingEvent && (
        <ConfirmDialog
          isOpen={true}
          title={isRecurringEvent ? "Delete Recurring Event" : "Delete Event"}
          message={isRecurringEvent
            ? `Delete just this occurrence or all occurrences of "${editingEvent.title}"?`
            : `Are you sure you want to delete "${editingEvent.title}"?`
          }
          confirmText={isRecurringEvent ? "Delete All" : "Delete"}
          cancelText={isRecurringEvent ? "This Only" : "Cancel"}
          confirmVariant="destructive"
          onConfirm={() => {
            setShowDeleteOptions(false);
            deleteEvent(true);
          }}
          onCancel={() => {
            setShowDeleteOptions(false);
            if (isRecurringEvent) {
              deleteEvent(false);
            }
          }}
        />
      )}

      {/* Conflict Warning Confirmation */}
      {showConflictWarning && (
        <ConfirmDialog
          isOpen={true}
          title="Event Conflict"
          message={`${getConflictMessage(conflicts)}. Do you want to create this event anyway?`}
          confirmText="Create Anyway"
          cancelText="Go Back"
          confirmVariant="destructive"
          onConfirm={() => {
            setShowConflictWarning(false);
            if (editingEvent && isRecurringEvent) {
              setShowRecurringOptions(true);
            } else {
              saveEvent(false);
            }
          }}
          onCancel={() => {
            setShowConflictWarning(false);
            setPendingAction(null);
          }}
        />
      )}

      {/* Duration Warning Confirmation */}
      {showDurationWarning && (
        <ConfirmDialog
          isOpen={true}
          title="Long Event Duration"
          message={`This event is longer than 8 hours (${calculateDuration(startTime, endTime)?.text}). This might be a mistake. Do you want to create it anyway?`}
          confirmText="Create Anyway"
          cancelText="Go Back"
          onConfirm={() => {
            setShowDurationWarning(false);
            // After duration confirmation, check for conflicts
            if (conflicts.length > 0) {
              setShowConflictWarning(true);
            } else if (editingEvent && isRecurringEvent) {
              setShowRecurringOptions(true);
            } else {
              saveEvent(false);
            }
          }}
          onCancel={() => {
            setShowDurationWarning(false);
            setPendingAction(null);
          }}
        />
      )}
    </>
  );
}
