'use client';

import { useState, useRef, useCallback } from 'react';

interface TimeBarPickerProps {
  value: string;
  onChange: (time: string) => void;
  label: string;
  onDurationSelect?: (duration: number) => void;
}

export default function TimeBarPicker({ value, onChange, label, onDurationSelect }: TimeBarPickerProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Convert time string to minutes since midnight
  const timeToMinutes = (timeString: string): number => {
    if (!timeString) return 0;
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Convert minutes since midnight to time string
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Snap to 15-minute intervals
  const snapToInterval = (minutes: number): number => {
    return Math.round(minutes / 15) * 15;
  };

  // Handle click/drag on time bar
  const handleTimeSelect = useCallback((event: React.MouseEvent) => {
    if (!barRef.current) return;

    const rect = barRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, x / rect.width));
    
    // Convert percentage to minutes (24 hours = 1440 minutes)
    const totalMinutes = Math.floor(percentage * 1440);
    const snappedMinutes = snapToInterval(totalMinutes);
    
    const timeString = minutesToTime(snappedMinutes);
    onChange(timeString);
  }, [onChange]);

  // Handle mouse events for dragging
  const handleMouseDown = (event: React.MouseEvent) => {
    setIsDragging(true);
    handleTimeSelect(event);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (isDragging) {
      handleTimeSelect(event);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Calculate position of current time on bar
  const currentMinutes = timeToMinutes(value);
  const position = (currentMinutes / 1440) * 100;

  // Format time for display (12-hour format)
  const formatDisplayTime = (timeString: string): string => {
    if (!timeString) return '--:--';
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Quick time shortcuts
  const quickTimes = [
    { label: '9A', value: '09:00' },
    { label: '12P', value: '12:00' },
    { label: '2P', value: '14:00' },
    { label: '5P', value: '17:00' },
  ];

  return (
    <div className="space-y-4">
      {/* Label and Quick Actions */}
      <div className="flex items-center justify-between">
        <div className="text-sm font-mono font-bold text-card-foreground uppercase tracking-wider">
          {label}
        </div>
        <div className="flex gap-1">
          {quickTimes.map((time) => (
            <button
              key={time.value}
              type="button"
              onClick={() => onChange(time.value)}
              className={`px-2 py-1 text-xs font-mono transition-all duration-150 ${
                value === time.value
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {time.label}
            </button>
          ))}
        </div>
      </div>

      {/* Time Display */}
      <div className="text-center">
        <div className="text-3xl font-mono font-bold text-foreground">
          {formatDisplayTime(value)}
        </div>
        <div className="text-xs font-mono text-muted-foreground mt-1">
          {value || '00:00'} • CLICK BAR TO SELECT
        </div>
      </div>

      {/* Time Bar */}
      <div className="relative">
        {/* Hour markers */}
        <div className="flex justify-between text-xs font-mono text-muted-foreground mb-2">
          <span>12A</span>
          <span>6A</span>
          <span>12P</span>
          <span>6P</span>
          <span>12A</span>
        </div>

        {/* Main time bar */}
        <div
          ref={barRef}
          className="relative h-8 bg-muted cursor-pointer select-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Hour divisions */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: 24 }, (_, i) => (
              <div
                key={i}
                className="flex-1 border-r border-border opacity-30"
                style={{ borderRightWidth: i === 23 ? 0 : '1px' }}
              />
            ))}
          </div>

          {/* Business hours highlight (9 AM - 5 PM) */}
          <div
            className="absolute top-0 bottom-0 bg-primary opacity-10"
            style={{
              left: '37.5%',  // 9 AM
              width: '33.33%' // 8 hours (9 AM to 5 PM)
            }}
          />

          {/* Current time indicator */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-foreground transition-all duration-150"
            style={{ left: `${position}%` }}
          >
            <div className="absolute -top-1 -left-2 w-5 h-5 bg-foreground transform rotate-45" />
          </div>

          {/* Hover indicator */}
          <div className="absolute inset-0 bg-foreground opacity-0 hover:opacity-5 transition-opacity duration-150" />
        </div>

        {/* 4-hour markers */}
        <div className="flex justify-between text-xs font-mono text-muted-foreground mt-1 opacity-50">
          {Array.from({ length: 7 }, (_, i) => (
            <span key={i}>{i * 4}:00</span>
          ))}
        </div>
      </div>

      {/* Duration Shortcuts */}
      {onDurationSelect && (
        <div className="space-y-2">
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
            DURATION
          </div>
          <div className="flex gap-1">
            {[
              { label: '15M', minutes: 15 },
              { label: '30M', minutes: 30 },
              { label: '1H', minutes: 60 },
              { label: '2H', minutes: 120 },
            ].map((duration) => (
              <button
                key={duration.minutes}
                type="button"
                onClick={() => onDurationSelect(duration.minutes)}
                className="px-3 py-1 text-xs font-mono bg-muted text-muted-foreground hover:bg-foreground hover:text-background transition-all duration-150"
              >
                {duration.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}