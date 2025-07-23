'use client';

export type ViewMode = 'week' | 'month' | 'day';

interface ViewSelectorProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export default function ViewSelector({ currentView, onViewChange }: ViewSelectorProps) {
  const views = [
    { id: 'day' as const, name: 'Day', icon: '📋' },
    { id: 'week' as const, name: 'Week', icon: '📅' },
    { id: 'month' as const, name: 'Month', icon: '🗓️' }
  ];

  return (
    <div className="flex bg-gray-100 rounded-2xl p-1">
      {views.map((view) => (
        <button
          key={view.id}
          onClick={() => onViewChange(view.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
            currentView === view.id
              ? 'bg-white text-blue-600 shadow-md'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <span>{view.icon}</span>
          <span>{view.name}</span>
        </button>
      ))}
    </div>
  );
}