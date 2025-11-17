'use client';

import { useState, useMemo } from 'react';
import { CalendarEvent, DEFAULT_CATEGORIES } from '@/types/event';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchAndFilterProps {
  events: CalendarEvent[];
  onFilteredEventsChange: (filteredEvents: CalendarEvent[]) => void;
}

export default function SearchAndFilter({ events, onFilteredEventsChange }: SearchAndFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Search filter (use debounced value)
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(query) ||
        (event.description && event.description.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(event => 
        selectedCategories.includes(event.categoryId)
      );
    }

    // Date filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (dateFilter) {
      case 'today':
        filtered = filtered.filter(event => 
          event.date.toDateString() === today.toDateString()
        );
        break;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        filtered = filtered.filter(event => 
          event.date >= weekStart && event.date <= weekEnd
        );
        break;
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        filtered = filtered.filter(event => 
          event.date >= monthStart && event.date <= monthEnd
        );
        break;
    }

    return filtered;
  }, [events, debouncedSearchQuery, selectedCategories, dateFilter]);

  // Update parent component when filtered events change
  useMemo(() => {
    onFilteredEventsChange(filteredEvents);
  }, [filteredEvents, onFilteredEventsChange]);

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setDateFilter('all');
    setIsFilterOpen(false);
  };

  const hasActiveFilters = debouncedSearchQuery || selectedCategories.length > 0 || dateFilter !== 'all';

  return (
    <div className="bg-card rounded-2xl shadow-lg p-4 sm:p-6 mb-6 border border-border transition-colors duration-200" style={{ boxShadow: 'var(--shadow-lg)' }}>
      {/* Search Bar */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="text"
          placeholder="Search events by title or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-input border-2 border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all text-foreground placeholder-muted-foreground"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            <svg className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {/* Date Filter Buttons */}
          {(['all', 'today', 'week', 'month'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setDateFilter(filter)}
              className={`px-4 py-2 rounded-xl font-medium transition-all text-sm ${
                dateFilter === filter
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground'
              }`}
            >
              {filter === 'all' ? 'All Time' : filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex gap-2 items-center">
          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`px-4 py-2 rounded-xl font-medium transition-all text-sm flex items-center gap-2 ${
              isFilterOpen || selectedCategories.length > 0
                ? 'bg-accent text-accent-foreground shadow-md'
                : 'bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
            </svg>
            Categories
            {selectedCategories.length > 0 && (
              <span className="bg-accent-foreground bg-opacity-20 rounded-full px-2 py-0.5 text-xs">
                {selectedCategories.length}
              </span>
            )}
          </button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-4 py-2 bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-xl font-medium transition-all text-sm flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Category Filters */}
      {isFilterOpen && (
        <div className="mt-4 pt-4 border-t border-border">
          <h4 className="text-sm font-semibold text-foreground mb-3">Filter by Category:</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {DEFAULT_CATEGORIES.map((category) => (
              <label
                key={category.id}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedCategories.includes(category.id)
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-muted-foreground hover:bg-muted'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => toggleCategory(category.id)}
                  className="sr-only"
                />
                <span className="text-lg">{category.icon}</span>
                <span className="text-sm font-medium text-foreground truncate">{category.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Results Summary */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Showing {filteredEvents.length} of {events.length} events
            </span>
            {filteredEvents.length === 0 && events.length > 0 && (
              <span className="text-destructive font-medium">
                No events match your filters
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}