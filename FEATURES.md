# 📅 Calendar App - Complete Feature List

## 🎯 Core Features

### Multiple Calendar Views
- **Week View**: See your entire week at a glance with hourly time slots
- **Day View**: Focus on a single day with detailed hour-by-hour breakdown
- **Month View**: Get the big picture of your month
- **Agenda View**: List-based view showing upcoming events for next 7/14/30 days

### Event Management
- **Quick Add**: Natural language event creation (e.g., "Meeting tomorrow at 3pm")
- **Event Templates**: Pre-configured templates for common events
  - Daily Standup
  - Lunch Break
  - 1-Hour Meeting
  - Workout Session
  - Focus Time
  - Coffee Chat
  - Code Review
  - Doctor/Dentist Appointment
- **Drag & Drop**: Reschedule events by dragging them to different time slots
- **Event Categories**: Organize with 7 built-in categories (Work, Personal, Health, Social, Education, Travel, Other)
- **Priority Levels**: High/Medium/Low priority with visual indicators
- **Event Status**: Tentative/Confirmed/Cancelled states
- **Recurring Events**: Daily, weekly, monthly, yearly patterns with flexible end conditions

### Smart Features
- **Conflict Detection**: Automatic detection of overlapping events with visual warnings
- **Browser Notifications**: Customizable reminders (5 min to 1 day before events)
- **Event Search**: Fuzzy search across all event fields
- **Advanced Filtering**: Filter by category, date range, and text
- **Time Analytics**: Visualize time distribution across categories

### Data Management
- **Export to iCalendar**: Export events to .ics format for Google Calendar, Outlook, Apple Calendar
- **Import/Export**: JSON import/export for backup and data portability
- **Local Storage**: Automatic saving to browser storage
- **Undo/Redo**: Revert accidental changes (infrastructure ready)

### User Experience
- **Dark Mode**: Full dark mode support with smooth transitions
- **Vim Navigation**: Optional Vim-style keyboard navigation (H/J/K/L)
- **Keyboard Shortcuts**: Comprehensive keyboard shortcuts for power users
- **Command Palette**: Cmd/Ctrl+K for quick access to all features
- **Context Menus**: Right-click events for quick actions
- **Responsive Design**: Works on desktop, tablet, and mobile

## ⌨️ Keyboard Shortcuts

### General
- `?` - Show keyboard shortcuts panel
- `Ctrl/Cmd + K` - Open command palette
- `Ctrl/Cmd + Q` - Quick add event
- `N` - Create new event
- `T` - Open templates
- `S` - Toggle search
- `/` - Focus search
- `Esc` - Close dialog/modal

### Navigation
- `1` - Switch to Week view
- `2` - Switch to Day view
- `3` - Switch to Month view
- `4` - Switch to Agenda view
- `H` or `←` - Previous period
- `L` or `→` - Next period
- `G` - Go to today

### Vim Mode (when enabled)
- `H` - Move left
- `J` - Move down
- `K` - Move up
- `L` - Move right
- `Enter` - Select/Create event
- `?` - Toggle hints

### Event Actions
- `E` - Edit selected event
- `D` - Delete selected event
- `Ctrl/Cmd + D` - Duplicate event
- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + Shift + Z` - Redo

### Export & Import
- `Ctrl/Cmd + E` - Export calendar
- `Ctrl/Cmd + I` - Import events

## 🚀 Quick Start Guide

### Creating Events

#### Method 1: Quick Add (Fastest)
1. Press `Ctrl/Cmd + Q` or click the Quick Add bar
2. Type naturally: "Team meeting tomorrow at 3pm"
3. Review the preview
4. Click "Quick Add" or press Enter

#### Method 2: Templates
1. Press `T` or click the Templates button
2. Choose a pre-configured template
3. Template applies to selected date
4. Customize if needed

#### Method 3: Click Time Slot
1. Click any time slot in Week/Day view
2. Fill in event details
3. Add location, reminders, priority
4. Save

#### Method 4: Command Palette
1. Press `Ctrl/Cmd + K`
2. Type "create" or "new event"
3. Select from command list

### Managing Events

#### Edit Event
- Click on any event
- Or right-click → Edit
- Or press `E` when event is selected

#### Delete Event
- Right-click event → Delete
- Or open event → Delete button
- Or press `D` when selected

#### Duplicate Event
- Right-click event → Duplicate
- Or press `Ctrl/Cmd + D`
- Creates copy for next day

#### Reschedule Event
- Drag event to new time slot (Week/Day view)
- Supports cross-day dragging in Week view

### Searching & Filtering

#### Quick Search
1. Press `S` to toggle search
2. Type to search across all events
3. Results update in real-time

#### Advanced Filters
- Filter by category (multiple selection)
- Date range filtering
- Fuzzy text matching

### Exporting Your Calendar

#### To iCalendar (.ics)
1. Click Export button
2. Import file into:
   - Google Calendar
   - Apple Calendar
   - Outlook
   - Any calendar app supporting .ics

#### To JSON (Backup)
1. Open Export/Import panel
2. Click "Export to JSON"
3. Save for backup or transfer

### Time Analytics

1. Click the [STATS] button
2. View pie chart of time distribution
3. See hours spent per category
4. Analyze productivity patterns

## 🎨 Customization

### Event Fields
- **Title**: Required, searchable
- **Date & Time**: With duration calculator
- **Category**: 7 built-in categories
- **Priority**: High (red !), Medium, Low
- **Status**: Tentative (?), Confirmed, Cancelled (X)
- **Location**: With 📍 indicator
- **Description**: Free-form notes
- **Reminders**: 5min to 1 day before
- **Recurrence**: Flexible patterns

### Visual Indicators
- `[W]` Work - Blue
- `[P]` Personal - Purple
- `[H]` Health - Red
- `[S]` Social - Yellow
- `[E]` Education - Green
- `[T]` Travel - Teal
- `[O]` Other - Gray

- `!` High priority
- `[?]` Tentative status
- `[X]` Cancelled status
- `[R]` Recurring event
- `📍` Has location
- `🔔` Has reminder

## 🔧 Advanced Features

### Conflict Detection
- Automatically detects overlapping events
- Shows warning when creating conflicting events
- Displays list of conflicting events
- Option to create anyway

### Recurring Events
- Daily, Weekly, Monthly, Yearly patterns
- Custom intervals (e.g., every 2 weeks)
- End conditions: Never, After X times, Until date
- Weekly: Select specific days
- Monthly: Specific day of month
- Edit options: This event or All events
- Delete options: This event or All events

### Browser Notifications
- Enable in banner on first visit
- Customizable reminder time per event
- Shows event details in notification
- High priority events require interaction
- Checks every 30 seconds for upcoming events

### Vim Navigation
- Enable in settings
- Navigate calendar with H/J/K/L
- Press `?` to see Vim-specific hints
- Enter to create event at cursor
- Esc to exit modals

## 📱 Mobile Support

- Responsive design for all screen sizes
- Touch-friendly buttons and controls
- Swipe gestures (where applicable)
- Collapsible mobile navigation
- Optimized for both portrait and landscape

## 🎯 Best Practices

### Organizing Events
1. Use categories consistently
2. Set priorities for important events
3. Add locations for in-person events
4. Use descriptions for notes and context
5. Set appropriate reminders

### Productivity Tips
1. Use Quick Add for speed
2. Create templates for recurring meetings
3. Use Agenda view for planning
4. Review Time Analytics weekly
5. Set high priority for critical events
6. Use Vim mode for keyboard efficiency

### Data Safety
1. Export regularly to JSON for backups
2. Test imports on small datasets first
3. Use browser notifications for important events
4. Check for conflicts when scheduling

## 🐛 Troubleshooting

### Events Not Showing
- Check date range in current view
- Verify category filters
- Clear search filters
- Check event status (cancelled events hidden from some views)

### Notifications Not Working
- Click "Enable Notifications" banner
- Check browser notification permissions
- Ensure event has reminder time set
- Browser must be open for notifications

### Export Issues
- Use modern browser (Chrome, Firefox, Safari, Edge)
- Check download folder for .ics file
- Verify file opens in calendar app

### Performance
- App uses local storage (browser-based)
- Large event lists (>1000) may slow down
- Export and re-import to clean up data
- Clear browser cache if sluggish

## 🔮 Upcoming Features

- Multi-calendar support
- Calendar sharing
- Email notifications
- Custom event colors
- Attendee management with RSVP
- Integration with Google Calendar API
- Mobile app (PWA)
- Print layouts
- CSV export
- Advanced recurring patterns
- Event tags
- Calendar subscriptions
- Time zone support
- Collaborative features

## 💡 Tips & Tricks

1. **Quick Navigation**: Use number keys (1-4) to switch views instantly
2. **Power User**: Master keyboard shortcuts for 10x speed
3. **Natural Language**: Quick Add understands "tomorrow", "next Monday", "Friday at 2pm"
4. **Batch Actions**: Use command palette to perform multiple actions
5. **Time Blocking**: Use long events in Day view for focus time
6. **Categories**: Color-code your life for visual organization
7. **Templates**: Save time with templates for routine events
8. **Agenda View**: Perfect for morning planning sessions
9. **Conflicts**: System warns you - no more double-booking!
10. **Analytics**: Use stats to identify time sinks

---

**Version**: 2.0
**Last Updated**: November 2025
**Platform**: Web-based (Modern browsers)
**Storage**: Local browser storage (IndexedDB/LocalStorage)
