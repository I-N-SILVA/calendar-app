'use client';

import { CalendarEvent } from '@/types/event';
import { exportToJSON, exportToICS, importFromJSON, downloadFile, uploadFile } from '@/utils/exportImport';
import { useToast } from '@/contexts/ToastContext';

interface ExportImportPanelProps {
  events: CalendarEvent[];
  onImport: (events: CalendarEvent[]) => void;
  onClose: () => void;
}

export default function ExportImportPanel({ events, onImport, onClose }: ExportImportPanelProps) {
  const { showToast } = useToast();

  const handleExportJSON = () => {
    try {
      const json = exportToJSON(events);
      const filename = `calendar-export-${new Date().toISOString().split('T')[0]}.json`;
      downloadFile(json, filename, 'application/json');
      showToast('Events exported successfully', 'success');
    } catch (error) {
      showToast('Failed to export events', 'error');
    }
  };

  const handleExportICS = () => {
    try {
      const ics = exportToICS(events);
      const filename = `calendar-export-${new Date().toISOString().split('T')[0]}.ics`;
      downloadFile(ics, filename, 'text/calendar');
      showToast('Events exported to iCal format', 'success');
    } catch (error) {
      showToast('Failed to export events', 'error');
    }
  };

  const handleImportJSON = async () => {
    try {
      const content = await uploadFile('.json,application/json');
      const importedEvents = importFromJSON(content);
      onImport(importedEvents);
      showToast(`Imported ${importedEvents.length} events successfully`, 'success');
      onClose();
    } catch (error) {
      showToast('Failed to import events. Please check the file format.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-card border-2 border-border w-full max-w-2xl spacing-mathematical">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground font-mono uppercase tracking-wider mb-2">
              [EXPORT_IMPORT]
            </h3>
            <p className="text-muted-foreground text-sm font-mono">
              Backup or restore your calendar data
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

        <div className="space-y-6">
          {/* Export Section */}
          <div className="border-2 border-border spacing-mathematical">
            <h4 className="font-mono font-bold text-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              [EXPORT_DATA]
            </h4>
            <p className="text-muted-foreground text-sm mb-4 font-mono">
              Download your calendar data to back up or transfer to another device
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleExportJSON}
                className="brutalist-button bg-primary text-primary-foreground border-primary flex items-center justify-center gap-2"
                style={{ padding: 'var(--space-md) var(--space-lg)' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                [JSON] ({events.length} events)
              </button>
              <button
                onClick={handleExportICS}
                className="brutalist-button bg-secondary text-secondary-foreground border-secondary flex items-center justify-center gap-2"
                style={{ padding: 'var(--space-md) var(--space-lg)' }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                [iCal/ICS]
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div className="border-2 border-border spacing-mathematical">
            <h4 className="font-mono font-bold text-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3v-12" />
              </svg>
              [IMPORT_DATA]
            </h4>
            <p className="text-muted-foreground text-sm mb-4 font-mono">
              Import previously exported calendar data
            </p>
            <div className="bg-chart-4/10 border-2 border-chart-4 mb-4" style={{ padding: 'var(--space-md)' }}>
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-chart-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-sm font-mono text-chart-4">
                  <strong>Warning:</strong> Importing will add events to your current calendar. Duplicate events may be created.
                </div>
              </div>
            </div>
            <button
              onClick={handleImportJSON}
              className="brutalist-button bg-accent text-accent-foreground border-accent w-full flex items-center justify-center gap-2"
              style={{ padding: 'var(--space-md) var(--space-lg)' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              [IMPORT_FROM_JSON]
            </button>
          </div>

          {/* Info */}
          <div className="text-xs text-muted-foreground font-mono border-t border-border pt-4">
            <p>• JSON format is recommended for full data preservation</p>
            <p>• iCal format (.ics) can be imported into other calendar applications</p>
            <p>• Your data is stored locally in your browser</p>
          </div>
        </div>
      </div>
    </div>
  );
}
