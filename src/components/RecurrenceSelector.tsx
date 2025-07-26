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
      <label className="block text-sm font-semibold text-card-foreground mb-2 font-mono uppercase tracking-wider">
        [REPEAT]
      </label>
      
      {/* Toggle Switch */}
      <div className="flex items-center gap-3 mb-4">
        <button
          type="button"
          onClick={() => handleRecurrenceToggle(!isRecurring)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
            isRecurring ? 'bg-primary' : 'bg-muted'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-card transition-transform duration-200 ${
              isRecurring ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className="text-sm text-muted-foreground">
          {isRecurring ? 'Repeating event' : 'One-time event'}
        </span>
      </div>

      {/* Recurrence Description */}
      {isRecurring && recurrence && (
        <div className="mb-4 p-3 bg-primary/10 border border-primary">
          <div className="text-sm font-medium text-primary font-mono font-bold">
            [SCHEDULE] {getRecurrenceDescription(recurrence)}
          </div>
        </div>
      )}

      {/* Advanced Options */}
      {isRecurring && recurrence && (
        <div className="space-y-4">
          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Repeats
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['daily', 'weekly', 'monthly', 'yearly'] as const).map((freq) => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => updateRecurrence({ frequency: freq })}
                  className={`p-2 text-sm font-medium transition-colors font-mono uppercase ${
                    recurrence.frequency === freq
                      ? 'bg-primary text-primary-foreground font-bold'
                      : 'bg-muted text-muted-foreground hover:bg-foreground hover:text-background'
                  }`}
                >
                  {freq.charAt(0).toUpperCase() + freq.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Interval */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Every
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="99"
                value={recurrence.interval}
                onChange={(e) => updateRecurrence({ interval: parseInt(e.target.value) || 1 })}
                className="w-16 px-2 py-1 text-center bg-input border border-border rounded text-foreground"
              />
              <span className="text-sm text-muted-foreground">
                {recurrence.frequency === 'daily' ? 'day(s)' :
                 recurrence.frequency === 'weekly' ? 'week(s)' :
                 recurrence.frequency === 'monthly' ? 'month(s)' : 'year(s)'}
              </span>
            </div>
          </div>

          {/* Days of week for weekly recurrence */}
          {recurrence.frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">
                Repeat on
              </label>
              <div className="flex gap-2">
                {weekdays.map((day) => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleWeekday(day.value)}
                    className={`w-10 h-10 text-sm font-medium transition-colors font-mono font-bold ${
                      recurrence.daysOfWeek?.includes(day.value)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-foreground hover:text-background'
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
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Ends
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="endType"
                  checked={recurrence.endType === 'never'}
                  onChange={() => updateRecurrence({ endType: 'never', endValue: undefined })}
                  className="accent-primary"
                />
                <span className="text-sm text-muted-foreground">Never</span>
              </label>
              
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="endType"
                  checked={recurrence.endType === 'after'}
                  onChange={() => updateRecurrence({ endType: 'after', endValue: 10 })}
                  className="accent-primary"
                />
                <span className="text-sm text-muted-foreground">After</span>
                {recurrence.endType === 'after' && (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="1"
                      max="999"
                      value={typeof recurrence.endValue === 'number' ? recurrence.endValue : 10}
                      onChange={(e) => updateRecurrence({ endValue: parseInt(e.target.value) || 10 })}
                      className="w-16 px-2 py-1 text-center bg-input border border-border rounded text-sm text-foreground"
                    />
                    <span className="text-sm text-muted-foreground">occurrences</span>
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
                  className="accent-primary"
                />
                <span className="text-sm text-muted-foreground">Until</span>
                {recurrence.endType === 'until' && (
                  <input
                    type="date"
                    value={recurrence.endValue instanceof Date ? 
                      recurrence.endValue.toISOString().split('T')[0] : ''}
                    onChange={(e) => updateRecurrence({ endValue: new Date(e.target.value) })}
                    className="px-2 py-1 bg-input border border-border rounded text-sm text-foreground"
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