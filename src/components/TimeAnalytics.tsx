'use client';

import { CalendarEvent } from '@/types/event';

interface TimeAnalyticsProps {
  events: CalendarEvent[];
}

interface CategoryStats {
  name: string;
  hours: number;
  percentage: number;
  id: string;
}

export default function TimeAnalytics({ events }: TimeAnalyticsProps) {
  // Calculate time analytics
  const calculateStats = (): CategoryStats[] => {
    const categoryHours: Record<string, number> = {};
    let totalHours = 0;

    events.forEach(event => {
      const [startHour, startMin] = event.startTime.split(':').map(Number);
      const [endHour, endMin] = event.endTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;
      const duration = (endMinutes - startMinutes) / 60;

      if (duration > 0) {
        categoryHours[event.categoryId] = (categoryHours[event.categoryId] || 0) + duration;
        totalHours += duration;
      }
    });

    const stats = Object.entries(categoryHours).map(([id, hours]) => ({
      id,
      name: id.charAt(0).toUpperCase() + id.slice(1),
      hours: Math.round(hours * 10) / 10,
      percentage: Math.round((hours / totalHours) * 100)
    }));

    return stats.sort((a, b) => b.hours - a.hours);
  };

  const stats = calculateStats();
  const totalHours = stats.reduce((sum, stat) => sum + stat.hours, 0);

  // ASCII bar chart
  const renderAsciiBar = (percentage: number, width = 20) => {
    const filledBlocks = Math.round((percentage / 100) * width);
    const emptyBlocks = width - filledBlocks;
    return '█'.repeat(filledBlocks) + '░'.repeat(emptyBlocks);
  };

  if (stats.length === 0) {
    return (
      <div className="bg-card border border-border spacing-mathematical">
        <div className="text-center font-mono text-muted-foreground">
          [NO_DATA_AVAILABLE]
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border spacing-mathematical">
      <div className="border-b border-border pb-4 mb-4">
        <h3 className="font-mono font-bold text-foreground uppercase tracking-wider">
          [TIME_ANALYSIS]
        </h3>
        <div className="font-mono text-sm text-muted-foreground">
          TOTAL: {totalHours.toFixed(1)}H • {stats.length} CATEGORIES
        </div>
      </div>

      <div className="space-y-4">
        {stats.map((stat, index) => (
          <div key={stat.id} className="font-mono">
            <div className="flex justify-between items-center mb-1">
              <span className="text-foreground font-semibold uppercase tracking-wide">
                [{stat.name}]
              </span>
              <span className="text-muted-foreground text-sm">
                {stat.hours}H ({stat.percentage}%)
              </span>
            </div>
            <div className="text-primary">
              {renderAsciiBar(stat.percentage)}
            </div>
          </div>
        ))}
      </div>

      {/* Weekly comparison */}
      <div className="border-t border-border pt-4 mt-4">
        <h4 className="font-mono font-semibold text-foreground uppercase tracking-wide mb-3">
          [PRODUCTIVITY_METRICS]
        </h4>
        <div className="grid grid-cols-2 gap-4 font-mono text-sm">
          <div>
            <div className="text-muted-foreground">AVG_DAILY</div>
            <div className="text-foreground font-bold">
              {(totalHours / 7).toFixed(1)}H
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">EFFICIENCY</div>
            <div className="text-foreground font-bold">
              {totalHours > 40 ? 'HIGH' : totalHours > 20 ? 'MED' : 'LOW'}
            </div>
          </div>
        </div>
      </div>

      {/* ASCII calendar heatmap (simplified) */}
      <div className="border-t border-border pt-4 mt-4">
        <h4 className="font-mono font-semibold text-foreground uppercase tracking-wide mb-3">
          [ACTIVITY_HEATMAP]
        </h4>
        <div className="font-mono text-xs">
          <div className="flex gap-1 mb-2">
            <span className="text-muted-foreground w-8">MON</span>
            <div className="text-primary">
              {'█'.repeat(Math.min(10, Math.round(totalHours / 10)))}
              {'░'.repeat(Math.max(0, 10 - Math.round(totalHours / 10)))}
            </div>
          </div>
          <div className="flex gap-1 mb-2">
            <span className="text-muted-foreground w-8">TUE</span>
            <div className="text-secondary">
              {'█'.repeat(Math.min(10, Math.round(totalHours / 12)))}
              {'░'.repeat(Math.max(0, 10 - Math.round(totalHours / 12)))}
            </div>
          </div>
          <div className="flex gap-1 mb-2">
            <span className="text-muted-foreground w-8">WED</span>
            <div className="text-accent">
              {'█'.repeat(Math.min(10, Math.round(totalHours / 8)))}
              {'░'.repeat(Math.max(0, 10 - Math.round(totalHours / 8)))}
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            ░ LOW ▓ MED █ HIGH
          </div>
        </div>
      </div>
    </div>
  );
}