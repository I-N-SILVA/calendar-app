'use client';

import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme, cycleTheme } = useTheme();

  return (
    <button
      onClick={(e) => {
        if (e.shiftKey) {
          cycleTheme();
        } else {
          toggleTheme();
        }
      }}
      className="brutalist-button relative inline-flex items-center justify-center min-w-[100px] h-12 bg-foreground text-background hover:bg-background hover:text-foreground border-2 border-foreground group font-mono font-bold uppercase tracking-wider text-sm"
      aria-label={`Current theme: ${theme}. Click to toggle, Shift+Click to cycle`}
    >
      <div className="transition-all duration-300 ease-out">
        {theme === 'light' ? '[DARK]' : 
         theme === 'dark' ? '[TERM]' :
         theme === 'terminal-green' ? '[AMBER]' : '[LIGHT]'}
      </div>

      {/* Brutalist Tooltip */}
      <div className="absolute -bottom-10 left-0 opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out bg-foreground text-background text-xs px-2 py-1 border border-foreground font-mono font-semibold whitespace-nowrap">
        [SHIFT+CLICK_CYCLE]
      </div>
    </button>
  );
}