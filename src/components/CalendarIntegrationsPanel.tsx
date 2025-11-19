'use client';

import { useState, useEffect } from 'react';
import {
  getGmailConnection,
  getOutlookConnection,
  initiateGmailOAuth,
  initiateOutlookOAuth,
  disconnectGmail,
  disconnectOutlook,
  CalendarConnection
} from '@/utils/calendarIntegrations';

interface CalendarIntegrationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (gmail: boolean, outlook: boolean) => void;
}

export default function CalendarIntegrationsPanel({ isOpen, onClose, onStatusChange }: CalendarIntegrationsPanelProps) {
  const [gmailConnection, setGmailConnection] = useState<CalendarConnection>({ provider: 'gmail', connected: false });
  const [outlookConnection, setOutlookConnection] = useState<CalendarConnection>({ provider: 'outlook', connected: false });
  const [gmailLoading, setGmailLoading] = useState(false);
  const [outlookLoading, setOutlookLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Load connection status when panel opens
      setGmailConnection(getGmailConnection());
      setOutlookConnection(getOutlookConnection());
    }
  }, [isOpen]);

  useEffect(() => {
    // Notify parent of status changes
    if (onStatusChange) {
      onStatusChange(gmailConnection.connected, outlookConnection.connected);
    }
  }, [gmailConnection.connected, outlookConnection.connected, onStatusChange]);

  const handleGmailConnect = () => {
    setGmailLoading(true);
    setError(null);
    setSuccess(null);

    initiateGmailOAuth(
      (connection) => {
        setGmailConnection(connection);
        setGmailLoading(false);
        setSuccess(`Successfully connected to Gmail: ${connection.email}`);
        setTimeout(() => setSuccess(null), 5000);
      },
      (errorMsg) => {
        setGmailLoading(false);
        setError(`Gmail connection failed: ${errorMsg}`);
        setTimeout(() => setError(null), 5000);
      }
    );
  };

  const handleGmailDisconnect = () => {
    disconnectGmail();
    setGmailConnection({ provider: 'gmail', connected: false });
    setSuccess('Gmail disconnected successfully');
    setTimeout(() => setSuccess(null), 5000);
  };

  const handleOutlookConnect = () => {
    setOutlookLoading(true);
    setError(null);
    setSuccess(null);

    initiateOutlookOAuth(
      (connection) => {
        setOutlookConnection(connection);
        setOutlookLoading(false);
        setSuccess(`Successfully connected to Outlook: ${connection.email}`);
        setTimeout(() => setSuccess(null), 5000);
      },
      (errorMsg) => {
        setOutlookLoading(false);
        setError(`Outlook connection failed: ${errorMsg}`);
        setTimeout(() => setError(null), 5000);
      }
    );
  };

  const handleOutlookDisconnect = () => {
    disconnectOutlook();
    setOutlookConnection({ provider: 'outlook', connected: false });
    setSuccess('Outlook disconnected successfully');
    setTimeout(() => setSuccess(null), 5000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-card shadow-2xl w-full max-w-3xl transform transition-all max-h-[90vh] overflow-y-auto border border-border spacing-mathematical">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-card-foreground mb-1 font-mono uppercase tracking-wider">
              [CALENDAR_INTEGRATIONS]
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground font-mono">
              Connect your Gmail or Outlook calendar
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

        {/* Status Messages */}
        {error && (
          <div className="mb-6 bg-destructive/10 border-2 border-destructive spacing-mathematical animate-in slide-in-from-top-2">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="font-mono text-destructive text-sm">{error}</div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-chart-5/10 border-2 border-chart-5 spacing-mathematical animate-in slide-in-from-top-2">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-chart-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="font-mono text-chart-5 text-sm">{success}</div>
            </div>
          </div>
        )}

        {/* Gmail Integration */}
        <div className="mb-6 border-2 border-border spacing-mathematical">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="text-4xl">📧</div>
              <div>
                <h4 className="font-mono font-bold text-foreground text-lg">Gmail Calendar</h4>
                <p className="text-sm text-muted-foreground font-mono">
                  {gmailConnection.connected
                    ? `Connected: ${gmailConnection.email}`
                    : 'Not connected'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {gmailConnection.connected ? (
                <span className="px-3 py-1 bg-chart-5 text-background border-2 border-chart-5 font-mono text-xs font-bold">
                  [CONNECTED]
                </span>
              ) : (
                <span className="px-3 py-1 bg-muted text-muted-foreground border-2 border-border font-mono text-xs font-bold">
                  [DISCONNECTED]
                </span>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            {gmailConnection.connected ? (
              <button
                onClick={handleGmailDisconnect}
                className="w-full brutalist-button bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                [DISCONNECT_GMAIL]
              </button>
            ) : (
              <button
                onClick={handleGmailConnect}
                disabled={gmailLoading}
                className="w-full brutalist-button bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {gmailLoading ? '[CONNECTING...]' : '[CONNECT_GMAIL]'}
              </button>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground font-mono">
            <p className="mb-2">
              <strong>Requires setup:</strong> Create OAuth credentials at{' '}
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Google Cloud Console
              </a>
            </p>
            <p>Set NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable</p>
          </div>
        </div>

        {/* Outlook Integration */}
        <div className="border-2 border-border spacing-mathematical">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="text-4xl">📅</div>
              <div>
                <h4 className="font-mono font-bold text-foreground text-lg">Outlook Calendar</h4>
                <p className="text-sm text-muted-foreground font-mono">
                  {outlookConnection.connected
                    ? `Connected: ${outlookConnection.email}`
                    : 'Not connected'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {outlookConnection.connected ? (
                <span className="px-3 py-1 bg-chart-5 text-background border-2 border-chart-5 font-mono text-xs font-bold">
                  [CONNECTED]
                </span>
              ) : (
                <span className="px-3 py-1 bg-muted text-muted-foreground border-2 border-border font-mono text-xs font-bold">
                  [DISCONNECTED]
                </span>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            {outlookConnection.connected ? (
              <button
                onClick={handleOutlookDisconnect}
                className="w-full brutalist-button bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                [DISCONNECT_OUTLOOK]
              </button>
            ) : (
              <button
                onClick={handleOutlookConnect}
                disabled={outlookLoading}
                className="w-full brutalist-button bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {outlookLoading ? '[CONNECTING...]' : '[CONNECT_OUTLOOK]'}
              </button>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground font-mono">
            <p className="mb-2">
              <strong>Requires setup:</strong> Register app at{' '}
              <a
                href="https://portal.azure.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Azure Portal
              </a>
            </p>
            <p>Set NEXT_PUBLIC_MICROSOFT_CLIENT_ID environment variable</p>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 pt-6 border-t border-border">
          <h5 className="font-mono font-bold text-foreground mb-3">[SETUP_INSTRUCTIONS]</h5>
          <div className="text-sm font-mono space-y-2 text-muted-foreground">
            <p>1. Create OAuth credentials for your chosen provider(s)</p>
            <p>2. Add environment variables to .env.local:</p>
            <pre className="bg-muted p-3 mt-2 text-xs overflow-x-auto">
{`NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=your_microsoft_client_id`}
            </pre>
            <p className="mt-2">3. Configure redirect URIs in your OAuth apps:</p>
            <pre className="bg-muted p-3 mt-2 text-xs">
{`${typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'}/auth/gmail/callback
${typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'}/auth/outlook/callback`}
            </pre>
            <p className="mt-2">4. Restart your development server</p>
          </div>
        </div>
      </div>
    </div>
  );
}
