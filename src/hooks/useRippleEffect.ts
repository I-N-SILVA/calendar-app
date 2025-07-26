'use client';

import { useCallback } from 'react';

export function useRippleEffect() {
  const createRipple = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    // Remove existing ripple
    const existingRipple = button.querySelector('.ripple-circle');
    if (existingRipple) {
      existingRipple.remove();
    }

    // Create new ripple
    const ripple = document.createElement('span');
    ripple.className = 'ripple-circle';
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: var(--foreground);
      border-radius: 0;
      transform: scale(0);
      animation: ripple 0.4s linear;
      pointer-events: none;
      z-index: 1;
    `;

    button.appendChild(ripple);

    // Remove ripple after animation
    setTimeout(() => {
      ripple.remove();
    }, 400);
  }, []);

  return createRipple;
}