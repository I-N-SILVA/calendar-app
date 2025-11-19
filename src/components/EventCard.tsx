'use client';

import { CalendarEvent, DEFAULT_CATEGORIES } from '@/types/event';
import { useState } from 'react';

interface EventCardProps {
  event: CalendarEvent;
  variant?: 'default' | 'compact' | 'list';
  showQuickActions?: boolean;
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (eventId: string) => void;
  onDuplicate?: (event: CalendarEvent) => void;
  onClick?: (event: CalendarEvent) => void;
  isDragging?: boolean;
  isSelected?: boolean;
  className?: string;
}

export default function EventCard({
  event,
  variant = 'default',
  showQuickActions = true,
  onEdit,
  onDelete,
  onDuplicate,
  onClick,
  isDragging = false,
  isSelected = false,
  className = '',
}: EventCardProps) {
  const [showActions, setShowActions] = useState(false);

  // Check if event is in the past
  const isPast = new Date(event.date) < new Date(new Date().setHours(0, 0, 0, 0));

  // Get category colors
  const category = DEFAULT_CATEGORIES.find(cat => cat.id === event.categoryId) || DEFAULT_CATEGORIES.find(cat => cat.id === 'other')!;

  // Priority badge colors
  const priorityColors = {
    high: 'bg-error text-error-foreground',
    medium: 'bg-warning text-warning-foreground',
    low: 'bg-success text-success-foreground',
  };

  // Status badge colors
  const statusColors = {
    confirmed: 'bg-success text-success-foreground',
    tentative: 'bg-warning text-warning-foreground',
    cancelled: 'bg-destructive text-destructive-foreground',
  };

  // Variant-specific classes
  const variantClasses = {
    default: 'p-4',
    compact: 'p-3',
    list: 'p-4 flex-row items-center',
  };

  const handleClick = () => {
    if (onClick) {
      onClick(event);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(event);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      onDelete(event.id);
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDuplicate) {
      onDuplicate(event);
    }
  };

  return (
    <div
      className={`
        event-card
        bg-card
        border-2 border-border
        transition-all duration-200
        cursor-pointer
        relative
        overflow-hidden
        ${variantClasses[variant]}
        ${isDragging ? 'opacity-50 scale-95' : ''}
        ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
        ${isPast ? 'opacity-60' : ''}
        ${className}
      `}
      style={{
        borderLeftWidth: '6px',
        borderLeftColor: category.borderColorHex,
        boxShadow: 'var(--shadow-sm)',
      }}
      onClick={handleClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Main Content */}
      <div className="flex flex-col gap-2">
        {/* Title and Priority Row */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-xl flex-shrink-0">{category.emoji}</span>
            <h3
              className={`
                font-bold text-foreground font-mono
                ${variant === 'compact' ? 'text-sm' : 'text-base'}
                ${variant === 'list' ? 'text-lg' : ''}
                line-clamp-2
                flex-1
              `}
            >
              {event.title}
            </h3>
          </div>

          {/* Priority Badge */}
          {event.priority && event.priority !== 'medium' && (
            <span
              className={`
                px-2 py-1 text-xs font-mono font-bold uppercase
                ${priorityColors[event.priority]}
                flex-shrink-0
              `}
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              {event.priority}
            </span>
          )}
        </div>

        {/* Time Range */}
        <div className="flex items-center gap-2 text-muted-foreground">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm font-mono">
            {event.startTime} - {event.endTime}
          </span>
        </div>

        {/* Location (if available) */}
        {event.location && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="text-sm font-mono truncate">{event.location}</span>
          </div>
        )}

        {/* Description (truncated, only in default variant) */}
        {variant === 'default' && event.description && (
          <p className="text-sm text-muted-foreground font-mono line-clamp-2 mt-1">
            {event.description}
          </p>
        )}

        {/* Status Badge */}
        {event.status && event.status !== 'confirmed' && (
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`
                px-2 py-1 text-xs font-mono font-bold uppercase
                ${statusColors[event.status]}
              `}
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              {event.status}
            </span>
          </div>
        )}

        {/* Category Badge (only in list variant) */}
        {variant === 'list' && (
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-1 text-xs font-mono uppercase bg-muted text-muted-foreground"
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              {event.categoryId}
            </span>
          </div>
        )}

        {/* Reminder Indicator */}
        {event.reminderMinutes && event.reminderMinutes > 0 && (
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="font-mono">{event.reminderMinutes}min</span>
          </div>
        )}

        {/* Recurring Indicator */}
        {event.isRecurring && (
          <div className="flex items-center gap-1 text-muted-foreground text-xs">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span className="font-mono">Recurring</span>
          </div>
        )}
      </div>

      {/* Quick Actions (shown on hover) */}
      {showQuickActions && (showActions || isSelected) && (
        <div
          className="absolute top-2 right-2 flex gap-1 bg-background/95 backdrop-blur-sm p-1 border-2 border-border"
          style={{
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Edit Button */}
          {onEdit && (
            <button
              onClick={handleEdit}
              className="p-2 hover:bg-primary hover:text-primary-foreground transition-colors"
              style={{ borderRadius: 'var(--radius-sm)' }}
              title="Edit event"
              aria-label="Edit event"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          )}

          {/* Duplicate Button */}
          {onDuplicate && (
            <button
              onClick={handleDuplicate}
              className="p-2 hover:bg-secondary hover:text-secondary-foreground transition-colors"
              style={{ borderRadius: 'var(--radius-sm)' }}
              title="Duplicate event"
              aria-label="Duplicate event"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
          )}

          {/* Delete Button */}
          {onDelete && (
            <button
              onClick={handleDelete}
              className="p-2 hover:bg-destructive hover:text-destructive-foreground transition-colors"
              style={{ borderRadius: 'var(--radius-sm)' }}
              title="Delete event"
              aria-label="Delete event"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Hover Effect Overlay */}
      <div
        className={`
          absolute inset-0 pointer-events-none
          transition-opacity duration-200
          ${showActions ? 'opacity-100' : 'opacity-0'}
        `}
        style={{
          background: 'linear-gradient(135deg, transparent 0%, rgba(0,0,0,0.02) 100%)',
        }}
      />
    </div>
  );
}
