'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Settings {
  workHoursStart: number; // 0-23
  workHoursEnd: number; // 0-23
  firstDayOfWeek: number; // 0 = Sunday, 1 = Monday
  defaultEventDuration: number; // minutes
  reminderMinutes: number; // minutes before event
  notificationsEnabled: boolean;
}

const DEFAULT_SETTINGS: Settings = {
  workHoursStart: 8,
  workHoursEnd: 18,
  firstDayOfWeek: 0,
  defaultEventDuration: 60,
  reminderMinutes: 15,
  notificationsEnabled: false,
};

interface SettingsContextType {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
  resetSettings: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const saved = localStorage.getItem('calendar-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  const updateSettings = (updates: Partial<Settings>) => {
    setSettings(prev => {
      const newSettings = { ...prev, ...updates };
      localStorage.setItem('calendar-settings', JSON.stringify(newSettings));
      return newSettings;
    });
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem('calendar-settings', JSON.stringify(DEFAULT_SETTINGS));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
