'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ViewMode } from '@/components/ViewSelector';

interface CalendarSelection {
  date: Date;
  hour?: number;
  view: ViewMode;
}

interface CalendarNavigationContextType {
  selection: CalendarSelection | null;
  setSelection: (selection: CalendarSelection | null) => void;
  moveUp: () => void;
  moveDown: () => void;
  moveLeft: () => void;
  moveRight: () => void;
  selectCurrent: () => void;
  isSelected: (date: Date, hour?: number) => boolean;
}

const CalendarNavigationContext = createContext<CalendarNavigationContextType | undefined>(undefined);

export function CalendarNavigationProvider({ children }: { children: ReactNode }) {
  const [selection, setSelection] = useState<CalendarSelection | null>(null);

  const isSelected = useCallback((date: Date, hour?: number) => {
    if (!selection) return false;

    const sameDate = date.toDateString() === selection.date.toDateString();

    if (selection.view === 'week' || selection.view === 'day') {
      return sameDate && selection.hour === hour;
    } else {
      // Month view - just check date
      return sameDate;
    }
  }, [selection]);

  const moveUp = useCallback(() => {
    if (!selection) {
      // Initialize selection to current date/hour
      setSelection({
        date: new Date(),
        hour: new Date().getHours(),
        view: 'week'
      });
      return;
    }

    if (selection.view === 'week' || selection.view === 'day') {
      // Move up one hour
      const newHour = Math.max(0, (selection.hour ?? 0) - 1);
      setSelection({ ...selection, hour: newHour });
    } else if (selection.view === 'month') {
      // Move up one week
      const newDate = new Date(selection.date);
      newDate.setDate(newDate.getDate() - 7);
      setSelection({ ...selection, date: newDate });
    }
  }, [selection]);

  const moveDown = useCallback(() => {
    if (!selection) {
      setSelection({
        date: new Date(),
        hour: new Date().getHours(),
        view: 'week'
      });
      return;
    }

    if (selection.view === 'week' || selection.view === 'day') {
      // Move down one hour
      const newHour = Math.min(23, (selection.hour ?? 0) + 1);
      setSelection({ ...selection, hour: newHour });
    } else if (selection.view === 'month') {
      // Move down one week
      const newDate = new Date(selection.date);
      newDate.setDate(newDate.getDate() + 7);
      setSelection({ ...selection, date: newDate });
    }
  }, [selection]);

  const moveLeft = useCallback(() => {
    if (!selection) {
      setSelection({
        date: new Date(),
        hour: new Date().getHours(),
        view: 'week'
      });
      return;
    }

    // Move to previous day
    const newDate = new Date(selection.date);
    newDate.setDate(newDate.getDate() - 1);
    setSelection({ ...selection, date: newDate });
  }, [selection]);

  const moveRight = useCallback(() => {
    if (!selection) {
      setSelection({
        date: new Date(),
        hour: new Date().getHours(),
        view: 'week'
      });
      return;
    }

    // Move to next day
    const newDate = new Date(selection.date);
    newDate.setDate(newDate.getDate() + 1);
    setSelection({ ...selection, date: newDate });
  }, [selection]);

  const selectCurrent = useCallback(() => {
    // This will be handled by the parent component
    // We just make sure there's a selection
    if (!selection) {
      setSelection({
        date: new Date(),
        hour: new Date().getHours(),
        view: 'week'
      });
    }
  }, [selection]);

  return (
    <CalendarNavigationContext.Provider
      value={{
        selection,
        setSelection,
        moveUp,
        moveDown,
        moveLeft,
        moveRight,
        selectCurrent,
        isSelected
      }}
    >
      {children}
    </CalendarNavigationContext.Provider>
  );
}

export function useCalendarNavigation() {
  const context = useContext(CalendarNavigationContext);
  if (!context) {
    throw new Error('useCalendarNavigation must be used within CalendarNavigationProvider');
  }
  return context;
}
