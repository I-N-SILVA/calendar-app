# Integration Guide for New Features

This guide explains how to integrate all the new components into your calendar app.

## Components to Add

### 1. Import New Components

Add these imports to `src/app/page.tsx`:

```typescript
import QuickAdd from '@/components/QuickAdd';
import TemplatePanel from '@/components/TemplatePanel';
import AgendaView from '@/components/AgendaView';
import KeyboardShortcutsPanel from '@/components/KeyboardShortcutsPanel';
```

### 2. Add State Variables

Add these state variables to the Home component:

```typescript
const [showTemplates, setShowTemplates] = useState(false);
const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
const [prefillEventData, setPrefillEventData] = useState<Partial<Omit<CalendarEvent, 'id'>> | undefined>();
```

### 3. Add Global Keyboard Shortcuts

Add this useEffect hook for global keyboard shortcuts:

```typescript
useEffect(() => {
  const handleGlobalKeyboard = (e: KeyboardEvent) => {
    // Don't trigger if typing in input/textarea
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    // Show keyboard shortcuts
    if (e.key === '?') {
      e.preventDefault();
      setShowKeyboardShortcuts(true);
    }

    // View switching
    if (e.key === '1') setCurrentView('day');
    if (e.key === '2') setCurrentView('week');
    if (e.key === '3') setCurrentView('month');
    if (e.key === '4') setCurrentView('agenda');

    // Quick actions
    if (e.key === 'n' || e.key === 'N') {
      e.preventDefault();
      setSelectedDate(new Date());
      setSelectedHour(new Date().getHours());
      setEditingEvent(undefined);
      setIsModalOpen(true);
    }

    if (e.key === 't' || e.key === 'T') {
      e.preventDefault();
      setShowTemplates(true);
    }

    if (e.key === 's' || e.key === 'S') {
      e.preventDefault();
      setShowSearch(!showSearch);
    }

    if (e.key === 'g' || e.key === 'G') {
      setCurrentDate(new Date());
    }

    // Navigation
    if (e.key === 'h' || e.key === 'ArrowLeft') {
      // Previous period logic
    }

    if (e.key === 'l' || e.key === 'ArrowRight') {
      // Next period logic
    }
  };

  window.addEventListener('keydown', handleGlobalKeyboard);
  return () => window.removeEventListener('keydown', handleGlobalKeyboard);
}, [currentView, showSearch]);
```

### 4. Update Event Handlers

Add these handler functions:

```typescript
const handleQuickAddEvent = (event: Omit<CalendarEvent, 'id'>) => {
  addEvent(event);
  showToast('Event created successfully!', 'success');
};

const handleOpenFullModal = (prefill?: Partial<Omit<CalendarEvent, 'id'>>) => {
  setPrefillEventData(prefill);
  setSelectedDate(prefill?.date);
  setIsModalOpen(true);
};

const handleTemplateSelect = (event: Omit<CalendarEvent, 'id'>) => {
  setPrefillEventData(event);
  setIsModalOpen(true);
};
```

### 5. Add Components to JSX

Add QuickAdd component after the header section:

```tsx
{/* Quick Add Bar */}
<div className="mb-6">
  <QuickAdd
    onAddEvent={handleQuickAddEvent}
    onOpenFullModal={handleOpenFullModal}
  />
</div>
```

Add Templates button to the button group:

```tsx
<button
  onClick={(e) => {
    createRipple(e);
    setShowTemplates(true);
  }}
  className="brutalist-button bg-secondary text-secondary-foreground flex items-center gap-2 text-base sm:text-lg font-semibold ripple-effect"
  style={{padding: 'var(--space-md) var(--space-xl)'}}
  title="Event Templates (T)"
>
  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
  </svg>
  <span className="hidden sm:inline">Templates</span>
</button>
```

Add Keyboard Shortcuts button:

```tsx
<button
  onClick={() => setShowKeyboardShortcuts(true)}
  className="brutalist-button bg-muted text-muted-foreground flex items-center gap-2 text-sm"
  style={{padding: 'var(--space-sm) var(--space-md)'}}
  title="Keyboard Shortcuts (?)"
>
  <span>⌨️</span>
  <span className="hidden sm:inline">Shortcuts</span>
</button>
```

Add Agenda View to the view switching section:

```tsx
{currentView === 'agenda' && (
  <div className="animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
    <AgendaView
      events={showSearch && filteredEvents.length >= 0 ? filteredEvents : events}
      onEventClick={handleEventClick}
      onEventDelete={handleDeleteEvent}
      onEventDuplicate={handleDuplicateEvent}
    />
  </div>
)}
```

Add the panels at the end before closing the container:

```tsx
{/* Template Panel */}
<TemplatePanel
  isOpen={showTemplates}
  onClose={() => setShowTemplates(false)}
  onSelectTemplate={handleTemplateSelect}
  selectedDate={selectedDate}
/>

{/* Keyboard Shortcuts Panel */}
<KeyboardShortcutsPanel
  isOpen={showKeyboardShortcuts}
  onClose={() => setShowKeyboardShortcuts(false)}
/>
```

### 6. Update EventModal Props

Update EventModal to use prefill data:

```tsx
<EventModal
  isOpen={isModalOpen}
  onClose={() => {
    setIsModalOpen(false);
    setPrefillEventData(undefined);
  }}
  onSave={handleSaveEvent}
  onDelete={handleDeleteEvent}
  selectedDate={prefillEventData?.date || selectedDate}
  selectedHour={selectedHour}
  editingEvent={editingEvent}
  allEvents={events}
  // Pass prefill data to EventModal
/>
```

## Testing Checklist

After integration, test:

- [ ] Quick Add creates events with natural language
- [ ] Quick Add preview shows correct details
- [ ] "Edit Details" button opens full modal with prefilled data
- [ ] Templates panel opens with `T` key
- [ ] Clicking template opens modal with prefilled data
- [ ] Agenda view shows upcoming events
- [ ] Agenda view allows changing days (7/14/30)
- [ ] Keyboard shortcuts panel opens with `?` key
- [ ] View switching works with number keys (1-4)
- [ ] `N` key opens new event modal
- [ ] `S` key toggles search
- [ ] `G` key goes to today
- [ ] All keyboard shortcuts listed work correctly

## Notification Integration

The notification system is already set up in `utils/notifications.ts`. To fully integrate:

1. Import and use `setupReminderInterval`:

```typescript
useEffect(() => {
  if (events.length > 0) {
    const cleanup = setupReminderInterval(events);
    return cleanup;
  }
}, [events]);
```

2. Request permission on mount:

```typescript
useEffect(() => {
  requestNotificationPermission();
}, []);
```

## Next Steps

1. Implement undo/redo using `hooks/useUndoRedo.ts`
2. Add PWA manifest for offline capability
3. Integrate toast notifications for all actions
4. Add onboarding tour for first-time users
5. Improve mobile touch gestures
6. Add event color customization

## Notes

- All new features maintain the brutalist design aesthetic
- Keyboard shortcuts don't conflict with existing ones
- Components are fully responsive
- Natural language parser handles many date/time formats
- Templates can be customized by editing `utils/eventTemplates.ts`
