// Calendar Integration Utilities for Gmail and Outlook

export interface CalendarConnection {
  provider: 'gmail' | 'outlook';
  connected: boolean;
  email?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface IntegrationState {
  gmail: CalendarConnection;
  outlook: CalendarConnection;
}

// LocalStorage keys
const GMAIL_CONNECTION_KEY = 'calendar-gmail-connection';
const OUTLOOK_CONNECTION_KEY = 'calendar-outlook-connection';

/**
 * Get Gmail connection status from localStorage
 */
export function getGmailConnection(): CalendarConnection {
  if (typeof window === 'undefined') {
    return { provider: 'gmail', connected: false };
  }

  try {
    const stored = localStorage.getItem(GMAIL_CONNECTION_KEY);
    if (stored) {
      const connection = JSON.parse(stored);
      // Check if token is expired
      if (connection.expiresAt && connection.expiresAt < Date.now()) {
        // Token expired
        disconnectGmail();
        return { provider: 'gmail', connected: false };
      }
      return connection;
    }
  } catch (_error) {
    console.error('Error reading Gmail connection');
  }

  return { provider: 'gmail', connected: false };
}

/**
 * Get Outlook connection status from localStorage
 */
export function getOutlookConnection(): CalendarConnection {
  if (typeof window === 'undefined') {
    return { provider: 'outlook', connected: false };
  }

  try {
    const stored = localStorage.getItem(OUTLOOK_CONNECTION_KEY);
    if (stored) {
      const connection = JSON.parse(stored);
      // Check if token is expired
      if (connection.expiresAt && connection.expiresAt < Date.now()) {
        // Token expired
        disconnectOutlook();
        return { provider: 'outlook', connected: false };
      }
      return connection;
    }
  } catch (_error) {
    console.error('Error reading Outlook connection');
  }

  return { provider: 'outlook', connected: false };
}

/**
 * Save Gmail connection to localStorage
 */
export function saveGmailConnection(connection: CalendarConnection): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(GMAIL_CONNECTION_KEY, JSON.stringify(connection));
  } catch (_error) {
    console.error('Error saving Gmail connection');
  }
}

/**
 * Save Outlook connection to localStorage
 */
export function saveOutlookConnection(connection: CalendarConnection): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(OUTLOOK_CONNECTION_KEY, JSON.stringify(connection));
  } catch (_error) {
    console.error('Error saving Outlook connection');
  }
}

/**
 * Disconnect Gmail
 */
export function disconnectGmail(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(GMAIL_CONNECTION_KEY);
}

/**
 * Disconnect Outlook
 */
export function disconnectOutlook(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(OUTLOOK_CONNECTION_KEY);
}

/**
 * Initiate Gmail OAuth flow
 * This opens a popup window for Google OAuth
 *
 * @param onSuccess Callback when OAuth succeeds
 * @param onError Callback when OAuth fails
 *
 * Note: Requires NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable
 * To set up: https://console.cloud.google.com/apis/credentials
 */
export function initiateGmailOAuth(onSuccess: (connection: CalendarConnection) => void, onError: (error: string) => void): void {
  const GMAIL_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (!GMAIL_CLIENT_ID || GMAIL_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID') {
    onError('Gmail integration not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID environment variable.');
    return;
  }

  const REDIRECT_URI = `${window.location.origin}/auth/gmail/callback`;
  const SCOPE = 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/userinfo.email';

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${GMAIL_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `response_type=token&` +
    `scope=${encodeURIComponent(SCOPE)}&` +
    `include_granted_scopes=true`;

  openOAuthPopup(authUrl, 'Gmail OAuth', 'GMAIL_OAUTH_SUCCESS', 'GMAIL_OAUTH_ERROR', (data) => {
    const connection: CalendarConnection = {
      provider: 'gmail',
      connected: true,
      email: data.email,
      accessToken: data.accessToken,
      expiresAt: Date.now() + (data.expiresIn * 1000),
    };
    saveGmailConnection(connection);
    onSuccess(connection);
  }, onError);
}

/**
 * Initiate Outlook OAuth flow
 * This opens a popup window for Microsoft OAuth
 *
 * @param onSuccess Callback when OAuth succeeds
 * @param onError Callback when OAuth fails
 *
 * Note: Requires NEXT_PUBLIC_MICROSOFT_CLIENT_ID environment variable
 * To set up: https://portal.azure.com/
 */
export function initiateOutlookOAuth(onSuccess: (connection: CalendarConnection) => void, onError: (error: string) => void): void {
  const OUTLOOK_CLIENT_ID = process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_ID;

  if (!OUTLOOK_CLIENT_ID || OUTLOOK_CLIENT_ID === 'YOUR_MICROSOFT_CLIENT_ID') {
    onError('Outlook integration not configured. Please set NEXT_PUBLIC_MICROSOFT_CLIENT_ID environment variable.');
    return;
  }

  const REDIRECT_URI = `${window.location.origin}/auth/outlook/callback`;
  const SCOPE = 'openid profile email Calendars.ReadWrite User.Read';

  const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
    `client_id=${OUTLOOK_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `response_type=token&` +
    `scope=${encodeURIComponent(SCOPE)}`;

  openOAuthPopup(authUrl, 'Outlook OAuth', 'OUTLOOK_OAUTH_SUCCESS', 'OUTLOOK_OAUTH_ERROR', (data) => {
    const connection: CalendarConnection = {
      provider: 'outlook',
      connected: true,
      email: data.email,
      accessToken: data.accessToken,
      expiresAt: Date.now() + (data.expiresIn * 1000),
    };
    saveOutlookConnection(connection);
    onSuccess(connection);
  }, onError);
}

/**
 * Helper function to open OAuth popup and handle messaging
 */
function openOAuthPopup(
  authUrl: string,
  windowName: string,
  successType: string,
  errorType: string,
  onSuccess: (data: { accessToken: string; email: string; expiresIn: number }) => void,
  onError: (error: string) => void
): void {
  const width = 500;
  const height = 600;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  const popup = window.open(
    authUrl,
    windowName,
    `width=${width},height=${height},left=${left},top=${top}`
  );

  if (!popup) {
    onError('Popup blocked. Please allow popups for this site.');
    return;
  }

  // Listen for OAuth callback
  const messageHandler = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;

    if (event.data.type === successType) {
      onSuccess(event.data);
      window.removeEventListener('message', messageHandler);
    } else if (event.data.type === errorType) {
      onError(event.data.error || 'OAuth failed');
      window.removeEventListener('message', messageHandler);
    }
  };

  window.addEventListener('message', messageHandler);

  // Check if popup was closed without completing OAuth
  const checkPopup = setInterval(() => {
    if (popup.closed) {
      clearInterval(checkPopup);
      window.removeEventListener('message', messageHandler);
    }
  }, 1000);
}

/**
 * Check if we have valid Gmail connection
 */
export function isGmailConnected(): boolean {
  const connection = getGmailConnection();
  return connection.connected && !!connection.accessToken && (!connection.expiresAt || connection.expiresAt > Date.now());
}

/**
 * Check if we have valid Outlook connection
 */
export function isOutlookConnected(): boolean {
  const connection = getOutlookConnection();
  return connection.connected && !!connection.accessToken && (!connection.expiresAt || connection.expiresAt > Date.now());
}
