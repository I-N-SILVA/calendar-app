'use client';

import { useSettings } from '@/contexts/SettingsContext';
import { useToast } from '@/contexts/ToastContext';

interface SettingsPanelProps {
  onClose: () => void;
}

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { showToast } = useToast();

  const handleSave = () => {
    showToast('Settings saved successfully', 'success');
    onClose();
  };

  const handleReset = () => {
    resetSettings();
    showToast('Settings reset to defaults', 'info');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-card border-2 border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto spacing-mathematical">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground font-mono uppercase tracking-wider mb-2">
              [SETTINGS]
            </h3>
            <p className="text-muted-foreground text-sm font-mono">
              Customize your calendar preferences
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
          {/* Work Hours */}
          <div className="border-2 border-border spacing-mathematical">
            <h4 className="font-mono font-bold text-foreground uppercase tracking-wide mb-4">
              [WORK_HOURS]
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="brutalist-form-label mb-2 block">
                  Start Hour
                </label>
                <select
                  value={settings.workHoursStart}
                  onChange={(e) => updateSettings({ workHoursStart: Number(e.target.value) })}
                  className="brutalist-form-input w-full"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i === 0 ? '12 AM' : i === 12 ? '12 PM' : i > 12 ? `${i - 12} PM` : `${i} AM`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="brutalist-form-label mb-2 block">
                  End Hour
                </label>
                <select
                  value={settings.workHoursEnd}
                  onChange={(e) => updateSettings({ workHoursEnd: Number(e.target.value) })}
                  className="brutalist-form-input w-full"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i === 0 ? '12 AM' : i === 12 ? '12 PM' : i > 12 ? `${i - 12} PM` : `${i} AM`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 font-mono">
              Highlight these hours in calendar views
            </p>
          </div>

          {/* Week Start */}
          <div className="border-2 border-border spacing-mathematical">
            <h4 className="font-mono font-bold text-foreground uppercase tracking-wide mb-4">
              [WEEK_START]
            </h4>
            <select
              value={settings.firstDayOfWeek}
              onChange={(e) => updateSettings({ firstDayOfWeek: Number(e.target.value) })}
              className="brutalist-form-input w-full"
            >
              <option value={0}>Sunday</option>
              <option value={1}>Monday</option>
              <option value={6}>Saturday</option>
            </select>
          </div>

          {/* Default Event Duration */}
          <div className="border-2 border-border spacing-mathematical">
            <h4 className="font-mono font-bold text-foreground uppercase tracking-wide mb-4">
              [DEFAULT_EVENT_DURATION]
            </h4>
            <select
              value={settings.defaultEventDuration}
              onChange={(e) => updateSettings({ defaultEventDuration: Number(e.target.value) })}
              className="brutalist-form-input w-full"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </div>

          {/* Notifications */}
          <div className="border-2 border-border spacing-mathematical">
            <h4 className="font-mono font-bold text-foreground uppercase tracking-wide mb-4">
              [NOTIFICATIONS]
            </h4>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notificationsEnabled}
                onChange={(e) => updateSettings({ notificationsEnabled: e.target.checked })}
                className="w-5 h-5"
              />
              <span className="font-mono text-foreground">Enable event reminders</span>
            </label>
            {settings.notificationsEnabled && (
              <div className="mt-4">
                <label className="brutalist-form-label mb-2 block">
                  Remind me before
                </label>
                <select
                  value={settings.reminderMinutes}
                  onChange={(e) => updateSettings({ reminderMinutes: Number(e.target.value) })}
                  className="brutalist-form-input w-full"
                >
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6 pt-6 border-t border-border">
          <button
            onClick={handleSave}
            className="flex-1 brutalist-button bg-primary text-primary-foreground border-primary font-bold"
            style={{ padding: 'var(--space-md) var(--space-xl)' }}
          >
            [SAVE]
          </button>
          <button
            onClick={handleReset}
            className="flex-1 brutalist-button bg-muted text-muted-foreground border-muted font-bold"
            style={{ padding: 'var(--space-md) var(--space-xl)' }}
          >
            [RESET]
          </button>
        </div>
      </div>
    </div>
  );
}
