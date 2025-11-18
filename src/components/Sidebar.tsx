'use client';

import { useState, useEffect } from 'react';
import { useRippleEffect } from '@/hooks/useRippleEffect';

interface SidebarProps {
  onCreateEvent: () => void;
  onOpenCommandPalette: () => void;
  onToggleAnalytics: () => void;
  onToggleSearch: () => void;
  onOpenExportImport: () => void;
  onOpenSettings: () => void;
  onOpenTemplates: () => void;
  onOpenKeyboardShortcuts: () => void;
  showAnalytics: boolean;
  showSearch: boolean;
}

export default function Sidebar({
  onCreateEvent,
  onOpenCommandPalette,
  onToggleAnalytics,
  onToggleSearch,
  onOpenExportImport,
  onOpenSettings,
  onOpenTemplates,
  onOpenKeyboardShortcuts,
  showAnalytics,
  showSearch,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const createRipple = useRippleEffect();

  // Load collapsed state from localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState !== null) {
      setIsCollapsed(savedState === 'true');
    }
  }, []);

  // Save collapsed state to localStorage
  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden md:flex fixed left-0 top-0 bottom-0
          bg-card border-r-2 border-border
          flex-col justify-between
          transition-all duration-300 ease-in-out
          z-40
          ${isCollapsed ? 'w-16' : 'w-64'}
        `}
        aria-label="Main navigation"
      >
        {/* Top Section */}
        <div className="flex flex-col">
          {/* Header with toggle */}
          <div className="h-16 flex items-center justify-between px-4 border-b-2 border-border">
            {!isCollapsed && (
              <h2 className="font-mono font-bold text-lg text-foreground uppercase tracking-wide">
                MENU
              </h2>
            )}
            <button
              onClick={toggleCollapsed}
              className="p-2 hover:bg-muted rounded-md transition-colors focus-ring"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg
                className="w-5 h-5 text-foreground transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)' }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 py-4 space-y-1 px-2">
            {/* Primary Action - Create Event */}
            <button
              onClick={(e) => {
                createRipple(e);
                onCreateEvent();
              }}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-all font-medium shadow-sm hover:shadow-md focus-ring group"
              title="Create New Event (N)"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {!isCollapsed && <span className="text-sm font-mono">NEW EVENT</span>}
            </button>

            {/* Section: Views */}
            {!isCollapsed && (
              <div className="pt-4 pb-2">
                <p className="px-3 text-xs font-mono text-muted-foreground uppercase tracking-wider">Views</p>
              </div>
            )}

            <button
              onClick={(e) => {
                createRipple(e);
                onOpenCommandPalette();
              }}
              className="sidebar-btn"
              title="Command Palette (Cmd+K)"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {!isCollapsed && <span className="text-sm">Command Palette</span>}
              {!isCollapsed && <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">⌘K</kbd>}
            </button>

            <button
              onClick={(e) => {
                createRipple(e);
                onToggleAnalytics();
              }}
              className={`sidebar-btn ${showAnalytics ? 'bg-accent text-accent-foreground' : ''}`}
              title="Time Analytics"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              {!isCollapsed && <span className="text-sm">Analytics</span>}
            </button>

            <button
              onClick={(e) => {
                createRipple(e);
                onToggleSearch();
              }}
              className={`sidebar-btn ${showSearch ? 'bg-accent text-accent-foreground' : ''}`}
              title="Search & Filter"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {!isCollapsed && <span className="text-sm">Search</span>}
            </button>

            {/* Section: Tools */}
            {!isCollapsed && (
              <div className="pt-4 pb-2">
                <p className="px-3 text-xs font-mono text-muted-foreground uppercase tracking-wider">Tools</p>
              </div>
            )}

            <button
              onClick={(e) => {
                createRipple(e);
                onOpenTemplates();
              }}
              className="sidebar-btn"
              title="Event Templates (T)"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
              {!isCollapsed && <span className="text-sm">Templates</span>}
              {!isCollapsed && <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">T</kbd>}
            </button>

            <button
              onClick={(e) => {
                createRipple(e);
                onOpenExportImport();
              }}
              className="sidebar-btn"
              title="Export & Import"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              {!isCollapsed && <span className="text-sm">Import/Export</span>}
            </button>
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="border-t-2 border-border px-2 py-4 space-y-1">
          <button
            onClick={(e) => {
              createRipple(e);
              onOpenKeyboardShortcuts();
            }}
            className="sidebar-btn"
            title="Keyboard Shortcuts (?)"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            {!isCollapsed && <span className="text-sm">Shortcuts</span>}
            {!isCollapsed && <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">?</kbd>}
          </button>

          <button
            onClick={(e) => {
              createRipple(e);
              onOpenSettings();
            }}
            className="sidebar-btn"
            title="Settings"
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {!isCollapsed && <span className="text-sm">Settings</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t-2 border-border z-40 safe-area-bottom">
        <div className="grid grid-cols-5 gap-1 p-2">
          <button
            onClick={onCreateEvent}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-md bg-primary text-primary-foreground"
            aria-label="Create event"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-xs mt-1">New</span>
          </button>

          <button
            onClick={onOpenCommandPalette}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-md hover:bg-muted text-foreground"
            aria-label="Command palette"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3" />
            </svg>
            <span className="text-xs mt-1">Commands</span>
          </button>

          <button
            onClick={onToggleSearch}
            className={`flex flex-col items-center justify-center py-2 px-1 rounded-md ${showSearch ? 'bg-accent text-accent-foreground' : 'hover:bg-muted text-foreground'}`}
            aria-label="Search"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-xs mt-1">Search</span>
          </button>

          <button
            onClick={onOpenTemplates}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-md hover:bg-muted text-foreground"
            aria-label="Templates"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5h16M4 9h16M4 13h16M4 17h16" />
            </svg>
            <span className="text-xs mt-1">Templates</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="flex flex-col items-center justify-center py-2 px-1 rounded-md hover:bg-muted text-foreground"
            aria-label="Settings"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
            <span className="text-xs mt-1">Settings</span>
          </button>
        </div>
      </nav>

      <style jsx>{`
        .sidebar-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.625rem 0.75rem;
          border-radius: 0.375rem;
          transition: all 150ms ease;
          color: var(--foreground);
          font-size: 0.875rem;
          text-align: left;
        }

        .sidebar-btn:hover {
          background: var(--muted);
        }

        .sidebar-btn:focus-visible {
          outline: 2px solid var(--ring);
          outline-offset: 2px;
        }

        .safe-area-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </>
  );
}
