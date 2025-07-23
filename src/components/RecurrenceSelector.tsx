'use client';

// useState removed as it's not needed
import { RecurrenceRule } from '@/types/event';
import { getRecurrenceDescription } from '@/utils/recurrence';

interface RecurrenceSelectorProps {
  recurrence?: RecurrenceRule;
  isRecurring: boolean;
  onRecurrenceChange: (recurrence: RecurrenceRule | undefined, isRecurring: boolean) => void;
}

export default function RecurrenceSelector({ 
  recurrence, 
  isRecurring, 
  onRecurrenceChange 
}: RecurrenceSelectorProps) {
  // Remove unused variable

  const handleRecurrenceToggle = (enabled: boolean) => {
    if (!enabled) {
      onRecurrenceChange(undefined, false);
    } else {
      const defaultRule: RecurrenceRule = {
        frequency: 'weekly',
        interval: 1,
        endType: 'never'
      };
      onRecurrenceChange(defaultRule, true);
    }
  };

  const updateRecurrence = (updates: Partial<RecurrenceRule>) => {
    if (!recurrence) return;
    
    const newRule = { ...recurrence, ...updates };
    onRecurrenceChange(newRule, true);
  };

  const weekdays = [
    { value: 0, label: 'Sun' },
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' }
  ];

  const toggleWeekday = (day: number) => {
    if (!recurrence) return;
    
    const currentDays = recurrence.daysOfWeek || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day].sort();
    
    updateRecurrence({ daysOfWeek: newDays });
  };

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
        🔄 Recurring Event
      </label>
      
      {/* Toggle Switch */}
      <div className="flex items-center gap-3 mb-4">
        <button
          type="button"
          onClick={() => handleRecurrenceToggle(!isRecurring)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
            isRecurring ? 'bg-blue-500' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
              isRecurring ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {isRecurring ? 'Repeating event' : 'One-time event'}
        </span>
      </div>

      {/* Recurrence Description */}
      {isRecurring && recurrence && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-700">
          <div className="text-sm font-medium text-blue-800 dark:text-blue-200">
            📅 {getRecurrenceDescription(recurrence)}
          </div>
        </div>
      )}

      {/* Advanced Options */}
      {isRecurring && recurrence && (
        <div className="space-y-4">
          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Repeats
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => updateRecurrence({ frequency: freq })}
                  className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                    recurrence.frequency === freq
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Interval */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Every
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="99"
                value={recurrence.interval}
                onChange={(e) => updateRecurrence({ interval: parseInt(e.target.value) || 1 })}
                className="w-16 px-2 py-1 text-center bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {recurrence.frequency === 'daily' ? 'day(s)' :
                 recurrence.frequency === 'weekly' ? 'week(s)' :
                 recurrence.frequency === 'monthly' ? 'month(s)' : 'year(s)'}
              </span>
            </div>
          </div>

          {/* Days of week for weekly recurrence */}
          {recurrence.frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Repeat on
              </label>
              <div className="flex gap-2">
                {weekdays.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleWeekday(day.value)}
                    className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                      recurrence.daysOfWeek?.includes(day.value)
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* End condition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ends
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="endType"
                  checked={recurrence.endType === 'never'}
                  onChange={() => updateRecurrence({ endType: 'never', endValue: undefined })}
                  className="text-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Never</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="endType"
                  checked={recurrence.endType === 'after'}
                  onChange={() => updateRecurrence({ endType: 'after', endValue: 10 })}
                  className="text-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">After</span>
                {recurrence.endType === 'after' && (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      max="999"
                      value={typeof recurrence.endValue === 'number' ? recurrence.endValue : 10}
                      onChange={(e) => updateRecurrence({ endValue: parseInt(e.target.value) || 10 })}
                      className="w-16 px-2 py-1 text-center bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-gray-100"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">occurrences</span>
                  </div>
                )}
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="endType"
                  checked={recurrence.endType === 'until'}
                  onChange={() => {
                    const nextMonth = new Date();
                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                    updateRecurrence({ endType: 'until', endValue: nextMonth });
                  }}
                  className="text-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Until</span>
                {recurrence.endType === 'until' && (
                  <input
                    type="date"
                    value={recurrence.endValue instanceof Date ? 
                      recurrence.endValue.toISOString().split('T')[0] : ''}
                    onChange={(e) => updateRecurrence({ endValue: new Date(e.target.value) })}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-gray-100"
                  />
                )}
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}