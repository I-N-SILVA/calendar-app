'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface AriaAnnouncerContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const AriaAnnouncerContext = createContext<AriaAnnouncerContextType | undefined>(undefined);

export function useAriaAnnouncer() {
  const context = useContext(AriaAnnouncerContext);
  if (!context) {
    throw new Error('useAriaAnnouncer must be used within AriaAnnouncerProvider');
  }
  return context;
}

interface AriaAnnouncerProviderProps {
  children: ReactNode;
}

export function AriaAnnouncerProvider({ children }: AriaAnnouncerProviderProps) {
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (priority === 'assertive') {
      setAssertiveMessage(message);
      // Clear after announcement
      setTimeout(() => setAssertiveMessage(''), 1000);
    } else {
      setPoliteMessage(message);
      // Clear after announcement
      setTimeout(() => setPoliteMessage(''), 1000);
    }
  }, []);

  return (
    <AriaAnnouncerContext.Provider value={{ announce }}>
      {children}
      
      {/* ARIA Live Regions */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true"
        className="sr-only"
      >
        {politeMessage}
      </div>
      
      <div 
        role="alert" 
        aria-live="assertive" 
        aria-atomic="true"
        className="sr-only"
      >
        {assertiveMessage}
      </div>
    </AriaAnnouncerContext.Provider>
  );
}
