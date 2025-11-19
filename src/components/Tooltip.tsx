'use client';

import { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export default function Tooltip({
  content,
  children,
  position = 'top',
  delay = 500,
  className = '',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current && tooltipRef.current) {
        const triggerRect = triggerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();

        let x = 0;
        let y = 0;

        switch (position) {
          case 'top':
            x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
            y = triggerRect.top - tooltipRect.height - 8;
            break;
          case 'bottom':
            x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
            y = triggerRect.bottom + 8;
            break;
          case 'left':
            x = triggerRect.left - tooltipRect.width - 8;
            y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
            break;
          case 'right':
            x = triggerRect.right + 8;
            y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
            break;
        }

        setCoords({ x, y });
        setIsVisible(true);
      }
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className={`inline-block ${className}`}
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className="fixed z-[9999] px-3 py-2 text-xs font-mono text-background bg-foreground border-2 border-foreground shadow-lg pointer-events-none animate-in fade-in-0 zoom-in-95 duration-200"
          style={{
            top: `${coords.y}px`,
            left: `${coords.x}px`,
            borderRadius: 'var(--radius-sm)',
            maxWidth: '250px',
          }}
        >
          {content}
          {/* Arrow */}
          <div
            className="absolute w-2 h-2 bg-foreground border-foreground"
            style={{
              ...getArrowPosition(position),
              transform: 'rotate(45deg)',
            }}
          />
        </div>
      )}
    </>
  );
}

function getArrowPosition(position: string): React.CSSProperties {
  switch (position) {
    case 'top':
      return {
        bottom: '-5px',
        left: '50%',
        marginLeft: '-4px',
        borderRight: '2px solid',
        borderBottom: '2px solid',
      };
    case 'bottom':
      return {
        top: '-5px',
        left: '50%',
        marginLeft: '-4px',
        borderLeft: '2px solid',
        borderTop: '2px solid',
      };
    case 'left':
      return {
        right: '-5px',
        top: '50%',
        marginTop: '-4px',
        borderTop: '2px solid',
        borderRight: '2px solid',
      };
    case 'right':
      return {
        left: '-5px',
        top: '50%',
        marginTop: '-4px',
        borderBottom: '2px solid',
        borderLeft: '2px solid',
      };
    default:
      return {};
  }
}
