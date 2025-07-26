'use client';

export type ViewMode = 'week' | 'month' | 'day';

interface ViewSelectorProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export default function ViewSelector({ currentView, onViewChange }: ViewSelectorProps) {
  const views = [
    { id: 'day' as const, name: 'Day', icon: 'D' },
    { id: 'week' as const, name: 'Week', icon: 'W' },
    { id: 'month' as const, name: 'Month', icon: 'M' }
  ];

  return (
    <div className="flex bg-muted p-1 border border-border font-mono">
      {views.map((view) => (
        <button
          key={view.id}
          onClick={() => onViewChange(view.id)}
          className={`flex items-center gap-2 px-4 py-2 font-bold uppercase tracking-wider transition-all duration-200 ${
            currentView === view.id
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-card'
          }`}
        >
          <span className="font-mono text-lg">[{view.icon}]</span>
          <span>{view.name}</span>
        </button>
      ))}
    </div>
  );
}