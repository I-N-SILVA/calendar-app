'use client';

interface KeyboardHintsProps {
  isVisible: boolean;
  onClose: () => void;
  isVimMode: boolean;
}

export default function KeyboardHints({ isVisible, onClose, isVimMode }: KeyboardHintsProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border max-w-2xl w-full spacing-mathematical">
        <div className="border-b border-border" style={{padding: 'var(--space-lg)'}}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-mono font-bold text-foreground uppercase tracking-wider">
              [KEYBOARD_SHORTCUTS]
            </h3>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground font-mono text-lg"
            >
              [X]
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{padding: 'var(--space-lg)'}}>
          {/* General Shortcuts */}
          <div>
            <h4 className="font-mono font-bold text-foreground mb-4 uppercase tracking-wide">
              [GENERAL]
            </h4>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cmd+K</span>
                <span className="text-foreground">Command Palette</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">?</span>
                <span className="text-foreground">Show Shortcuts</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">V</span>
                <span className="text-foreground">Toggle Vim Mode</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shift+Click</span>
                <span className="text-foreground">Theme Cycle</span>
              </div>
            </div>
          </div>

          {/* Vim Mode Shortcuts */}
          <div>
            <h4 className="font-mono font-bold text-foreground mb-4 uppercase tracking-wide">
              [VIM_MODE] {isVimMode ? '[ACTIVE]' : '[INACTIVE]'}
            </h4>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">H</span>
                <span className="text-foreground">Move Left</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">J</span>
                <span className="text-foreground">Move Down</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">K</span>
                <span className="text-foreground">Move Up</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">L</span>
                <span className="text-foreground">Move Right</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Enter/Space</span>
                <span className="text-foreground">Select</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Esc</span>
                <span className="text-foreground">Exit Vim Mode</span>
              </div>
            </div>
          </div>

          {/* Command Palette */}
          <div>
            <h4 className="font-mono font-bold text-foreground mb-4 uppercase tracking-wide">
              [COMMAND_PALETTE]
            </h4>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">↑↓</span>
                <span className="text-foreground">Navigate</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ctrl+↑↓</span>
                <span className="text-foreground">History</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Enter</span>
                <span className="text-foreground">Execute</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Esc</span>
                <span className="text-foreground">Close</span>
              </div>
            </div>
          </div>

          {/* Power User */}
          <div>
            <h4 className="font-mono font-bold text-foreground mb-4 uppercase tracking-wide">
              [POWER_USER]
            </h4>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shift+Click</span>
                <span className="text-foreground">Bulk Select</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Drag</span>
                <span className="text-foreground">Move Events</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Click Slot</span>
                <span className="text-foreground">Quick Create</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border text-center font-mono text-xs text-muted-foreground" style={{padding: 'var(--space-md)'}}>
          [PRESS_?_TO_TOGGLE] • [VIM_MODE_AVAILABLE]
        </div>
      </div>
    </div>
  );
}