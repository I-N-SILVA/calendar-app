'use client';

import { useState, useEffect } from 'react';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  label: string;
  id: string;
  onDurationSelect?: (duration: number) => void;
}

export default function TimePicker({ value, onChange, label, id, onDurationSelect }: TimePickerProps) {
  const [selectedHour, setSelectedHour] = useState(9);
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [isAM, setIsAM] = useState(true);
  const [showClock, setShowClock] = useState(false);

  // Parse incoming time value
  useEffect(() => {
    if (value) {
      const [hour, minute] = value.split(':').map(Number);
      const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      setSelectedHour(hour12);
      setSelectedMinute(minute);
      setIsAM(hour < 12);
    }
  }, [value]);

  // Convert to 24-hour format and update parent
  const updateTime = (hour: number, minute: number, am: boolean) => {
    let hour24 = hour;
    if (am && hour === 12) hour24 = 0;
    if (!am && hour !== 12) hour24 = hour + 12;
    
    const timeString = `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    onChange(timeString);
  };

  const handleHourChange = (hour: number) => {
    setSelectedHour(hour);
    updateTime(hour, selectedMinute, isAM);
  };

  const handleMinuteChange = (minute: number) => {
    setSelectedMinute(minute);
    updateTime(selectedHour, minute, isAM);
  };

  const handleAMPMChange = (am: boolean) => {
    setIsAM(am);
    updateTime(selectedHour, selectedMinute, am);
  };

  const quickTimes = [
    { label: '9:00 AM', value: '09:00' },
    { label: '12:00 PM', value: '12:00' },
    { label: '2:00 PM', value: '14:00' },
    { label: '5:00 PM', value: '17:00' },
  ];

  const durations = [
    { label: '15min', minutes: 15 },
    { label: '30min', minutes: 30 },
    { label: '1hr', minutes: 60 },
    { label: '2hr', minutes: 120 },
  ];

  const setNow = () => {
    const now = new Date();
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    onChange(timeString);
  };

  const roundToQuarter = () => {
    const now = new Date();
    const minutes = Math.round(now.getMinutes() / 15) * 15;
    const hours = minutes === 60 ? now.getHours() + 1 : now.getHours();
    const finalMinutes = minutes === 60 ? 0 : minutes;
    const timeString = `${hours.toString().padStart(2, '0')}:${finalMinutes.toString().padStart(2, '0')}`;
    onChange(timeString);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-sm font-semibold text-card-foreground">
          {label}
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={setNow}
            className="px-2 py-1 text-xs bg-accent/20 text-accent hover:bg-accent/30 rounded-lg transition-colors"
          >
            Now
          </button>
          <button
            type="button"
            onClick={roundToQuarter}
            className="px-2 py-1 text-xs bg-secondary/20 text-secondary hover:bg-secondary/30 rounded-lg transition-colors"
          >
            Round
          </button>
        </div>
      </div>

      {/* Quick Time Presets */}
      <div className="grid grid-cols-4 gap-2">
        {quickTimes.map((time) => (
          <button
            key={time.value}
            type="button"
            onClick={() => onChange(time.value)}
            className={`px-3 py-2 text-xs rounded-lg transition-all duration-200 ${
              value === time.value
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
            }`}
          >
            {time.label}
          </button>
        ))}
      </div>

      {/* Duration Shortcuts */}
      {onDurationSelect && (
        <div>
          <div className="text-xs text-muted-foreground mb-2">Quick Duration:</div>
          <div className="grid grid-cols-4 gap-2">
            {durations.map((duration) => (
              <button
                key={duration.minutes}
                type="button"
                onClick={() => onDurationSelect(duration.minutes)}
                className="px-3 py-2 text-xs bg-accent/10 text-accent hover:bg-accent/20 rounded-lg transition-colors"
              >
                {duration.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Time Display */}
      <div className="relative">
        <div
          className="w-full px-4 py-3 text-center bg-card border-2 border-border rounded-xl cursor-pointer hover:border-primary/50 transition-all duration-200 group"
          onClick={() => setShowClock(!showClock)}
        >
          <div className="text-2xl font-mono font-bold text-foreground group-hover:text-primary transition-colors">
            {value || '00:00'}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Click to {showClock ? 'hide' : 'show'} time picker
          </div>
        </div>

        {/* Expandable Clock Interface */}
        {showClock && (
          <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-card border border-border rounded-xl shadow-lg z-10 animate-in fade-in-0 slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-3 gap-4">
              {/* Hours */}
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2 text-center">Hour</div>
                <div className="grid grid-cols-3 gap-1 max-h-24 overflow-y-auto">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                    <button
                      key={hour}
                      type="button"
                      onClick={() => handleHourChange(hour)}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        selectedHour === hour
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                      }`}
                    >
                      {hour}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minutes */}
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2 text-center">Min</div>
                <div className="grid grid-cols-2 gap-1 max-h-24 overflow-y-auto">
                  {[0, 15, 30, 45].map((minute) => (
                    <button
                      key={minute}
                      type="button"
                      onClick={() => handleMinuteChange(minute)}
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        selectedMinute === minute
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                      }`}
                    >
                      {minute.toString().padStart(2, '0')}
                    </button>
                  ))}
                </div>
              </div>

              {/* AM/PM */}
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-2 text-center">Period</div>
                <div className="space-y-1">
                  {[true, false].map((am) => (
                    <button
                      key={am ? 'AM' : 'PM'}
                      type="button"
                      onClick={() => handleAMPMChange(am)}
                      className={`w-full px-2 py-1 text-xs rounded transition-colors ${
                        isAM === am
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary'
                      }`}
                    >
                      {am ? 'AM' : 'PM'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        id={id}
        value={value}
        onChange={() => {}} // Controlled by the component
      />
    </div>
  );
}