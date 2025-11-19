'use client';

import { CalendarEvent, DEFAULT_CATEGORIES } from '@/types/event';
import { useState } from 'react';

interface GridEventCardProps {
  event: CalendarEvent;
  duration?: number; // Duration in hours for height calculation
  isContinuation?: boolean; // Is this a continuation from previous hour
  isDragging?: boolean;
  onEdit?: (event: CalendarEvent) => void;
  onDelete?: (eventId: string) => void;
  onDuplicate?: (event: CalendarEvent) => void;
  onClick?: (event: CalendarEvent) => void;
  onDragStart?: (event: CalendarEvent, e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onMouseDown?: (event: CalendarEvent, e: React.MouseEvent) => void;
  onMouseMove?: (e: React.MouseEvent) => void;
  onContextMenu?: (e: React.MouseEvent, event: CalendarEvent) => void;
  className?: string;
}

export default function GridEventCard({
  event,
  duration = 1,
  isContinuation = false,
  isDragging = false,
  onEdit,
  onDelete,
  onDuplicate,
  onClick,
  onDragStart,
  onDragEnd,
  onMouseDown,
  onMouseMove,
  onContextMenu,
  className = '',
}: GridEventCardProps) {
  const [showActions, setShowActions] = useState(false);

  // Get category colors
  const category = DEFAULT_CATEGORIES.find(cat => cat.id === event.categoryId) || DEFAULT_CATEGORIES.find(cat => cat.id === 'other')!;

  // Calculate height based on duration
  const heightMultiplier = Math.max(1, Math.min(duration, 6)); // Cap at 6 hours
  const minHeight = isContinuation ? 40 : 40 + (heightMultiplier - 1) * 20;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
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
      draggable={!isContinuation}
      className={`
        grid-event-card
        relative overflow-hidden
        cursor-pointer
        transition-all duration-150
        ${isDragging ? 'opacity-50 scale-95' : ''}
        ${isContinuation ? 'opacity-60' : ''}
        ${className}
      `}
      style={{
        minHeight: `${minHeight}px`,
        backgroundColor: 'var(--card)',
        borderLeft: `4px solid ${category.borderColorHex}`,
        borderRadius: 'var(--radius-sm)',
        padding: isContinuation ? 'var(--space-1) var(--space-2)' : 'var(--space-2) var(--space-3)',
        boxShadow: 'var(--shadow-sm)',
        zIndex: 10,
      }}
      onClick={handleClick}
      onDragStart={(e) => {
        if (!isContinuation && onDragStart) {
          e.stopPropagation();
          onDragStart(event, e);
        }
      }}
      onDragEnd={(e) => {
        if (onDragEnd) {
          onDragEnd(e);
        }
      }}
      onMouseDown={(e) => {
        if (onMouseDown) {
          onMouseDown(event, e);
        }
      }}
      onMouseMove={(e) => {
        if (onMouseMove) {
          onMouseMove(e);
        }
      }}
      onContextMenu={(e) => {
        if (onContextMenu) {
          onContextMenu(e, event);
        }
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Event Content */}
      <div className="flex flex-col gap-1">
        {/* Title */}
        <div className="flex items-start justify-between gap-1">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            {isContinuation ? (
              <span className="text-muted-foreground text-xs flex-shrink-0">↳</span>
            ) : (
              <span className="text-xs flex-shrink-0">{category.emoji}</span>
            )}
            <h4
              className="font-semibold text-foreground text-xs font-mono truncate"
              title={event.title}
            >
              {event.title}
            </h4>
          </div>

          {/* Priority Badge (only if high) */}
          {!isContinuation && event.priority === 'high' && (
            <span
              className="px-1 py-0.5 text-[10px] font-bold bg-error text-error-foreground flex-shrink-0"
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              !
            </span>
          )}
        </div>

        {/* Time (only for non-continuation) */}
        {!isContinuation && (
          <div className="text-[10px] text-muted-foreground font-mono">
            {event.startTime} - {event.endTime}
          </div>
        )}

        {/* Duration indicator for long events */}
        {!isContinuation && duration > 1 && (
          <div className="text-[10px] text-muted-foreground font-mono opacity-75">
            {duration.toFixed(1)}h
          </div>
        )}

        {/* Recurring indicator */}
        {!isContinuation && event.isRecurring && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>R</span>
          </div>
        )}
      </div>

      {/* Quick Actions (shown on hover, only for non-continuation) */}
      {!isContinuation && showActions && (onEdit || onDelete || onDuplicate) && (
        <div
          className="absolute top-1 right-1 flex gap-0.5 bg-background/95 backdrop-blur-sm p-0.5 border border-border"
          style={{
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-md)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Edit Button */}
          {onEdit && (
            <button
              onClick={handleEdit}
              className="p-1 hover:bg-primary hover:text-primary-foreground transition-colors"
              style={{ borderRadius: 'var(--radius-sm)' }}
              title="Edit event"
              aria-label="Edit event"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="p-1 hover:bg-secondary hover:text-secondary-foreground transition-colors"
              style={{ borderRadius: 'var(--radius-sm)' }}
              title="Duplicate event"
              aria-label="Duplicate event"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              className="p-1 hover:bg-destructive hover:text-destructive-foreground transition-colors"
              style={{ borderRadius: 'var(--radius-sm)' }}
              title="Delete event"
              aria-label="Delete event"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          transition-opacity duration-150
          ${showActions ? 'opacity-100' : 'opacity-0'}
        `}
        style={{
          background: 'linear-gradient(135deg, transparent 0%, rgba(0,0,0,0.03) 100%)',
        }}
      />
    </div>
  );
}
