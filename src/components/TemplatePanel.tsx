'use client';

import { DEFAULT_TEMPLATES, applyTemplate, EventTemplate } from '@/utils/eventTemplates';
import { CalendarEvent } from '@/types/event';

interface TemplatePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (event: Omit<CalendarEvent, 'id'>) => void;
  selectedDate?: Date;
}

export default function TemplatePanel({ isOpen, onClose, onSelectTemplate, selectedDate }: TemplatePanelProps) {
  if (!isOpen) return null;

  const handleSelectTemplate = (template: EventTemplate) => {
    const date = selectedDate || new Date();
    const event = applyTemplate(template, date);
    onSelectTemplate(event);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-card shadow-2xl w-full max-w-4xl transform transition-all max-h-[90vh] overflow-y-auto border border-border spacing-mathematical">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-card-foreground mb-1 font-mono uppercase tracking-wider">
              [EVENT_TEMPLATES]
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground font-mono">
              Quick create common events
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground hover:bg-muted p-2 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEFAULT_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => handleSelectTemplate(template)}
              className="group bg-card border-2 border-border hover:border-primary transition-all duration-200 text-left spacing-mathematical hover:transform hover:translate-x-1"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl">{template.icon}</div>
                {template.template.priority === 'high' && (
                  <span className="text-xs bg-destructive text-destructive-foreground px-2 py-1 font-mono">
                    HIGH
                  </span>
                )}
              </div>

              <div className="font-bold text-foreground mb-2 font-mono group-hover:text-primary transition-colors">
                {template.name}
              </div>

              <div className="text-sm text-muted-foreground font-mono space-y-1">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {template.template.startTime} - {template.template.endTime}
                </div>

                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  {template.template.categoryId.toUpperCase()}
                </div>

                {template.template.reminderMinutes && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {template.template.reminderMinutes}min reminder
                  </div>
                )}
              </div>

              {template.template.description && (
                <div className="mt-2 text-xs text-muted-foreground font-mono opacity-70 line-clamp-2">
                  {template.template.description}
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <div className="text-sm text-muted-foreground font-mono text-center">
            💡 Templates will use{' '}
            {selectedDate ? (
              <span className="text-foreground font-bold">
                {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            ) : (
              <span className="text-foreground font-bold">today&apos;s date</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
