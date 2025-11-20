import type { ModeHandler, Mode } from '../types';
import type { Shortcut } from '../../keyboardService';
import { keyboardService } from '../../keyboardService';
import { FontShortcuts } from '../categories/FontShortcuts';
import { SystemShortcuts } from '../categories/SystemShortcuts';
import { ShortcutManager } from '../ShortcutManager';
import { currentLineStore } from '$lib/stores/currentLineStore';
import { textStore, getLines } from '$lib/stores/textStore';
import { setCursorLine, setCursorColumn, getCursorPosition } from '$lib/stores/cursorStore';

export class ScriptMode implements ModeHandler {
  mode: Mode = 'script';
  private manager: ShortcutManager;

  constructor(manager: ShortcutManager) {
    this.manager = manager;
  }

  enter(): void {
    // Clear any existing character/special key handlers
    keyboardService.clearCharacterInputHandler();
    keyboardService.clearSpecialKeyHandler();

    // Register all script mode shortcuts
    this.registerShortcuts();
  }

  exit(): void {
    // Remove all script mode shortcuts
    this.removeShortcuts();
  }

  getShortcuts(): Shortcut[] {
    return [
      ...FontShortcuts.getShortcuts(),
      ...SystemShortcuts.getShortcuts(),
      // Mode switching shortcuts
      {
        key: 'i',
        action: () => {
          this.manager.switchToMode('interactive');
        },
        description: 'Switch to interactive mode'
      },
      {
        key: ':',
        shiftKey: true,
        action: () => {
          this.manager.switchToMode('command');
        },
        description: 'Switch to command mode'
      },
      {
        key: 'Escape',
        action: () => {
          // Already in script mode, but ensure we're here
          this.manager.switchToMode('script');
        },
        description: 'Ensure script mode'
      },
      {
        key: 'k',
        action: () => {
          // Navigate up: decrease current line by 1, but not below 0
          currentLineStore.update(currentLine => {
            const newLine = Math.max(0, currentLine - 1);
            // Also update cursor position
            setCursorLine(newLine);
            setCursorColumn(0); // Start of line
            return newLine;
          });
        },
        description: 'Move current line up'
      },
      {
        key: 'j',
        action: () => {
          // Navigate down: increase current line by 1, but not beyond available lines
          const lines = getLines();
          currentLineStore.update(currentLine => {
            const maxLine = Math.max(0, lines.length - 1);
            const newLine = Math.min(maxLine, currentLine + 1);
            // Also update cursor position
            setCursorLine(newLine);
            setCursorColumn(0); // Start of line
            return newLine;
          });
        },
        description: 'Move current line down'
      }
    ];
  }

  private registerShortcuts(): void {
    this.getShortcuts().forEach(shortcut => {
      keyboardService.addShortcut(shortcut);
    });
  }

  private removeShortcuts(): void {
    this.getShortcuts().forEach(shortcut => {
      keyboardService.removeShortcut(
        shortcut.key,
        shortcut.ctrlKey || false,
        shortcut.altKey || false,
        shortcut.shiftKey || false,
        shortcut.metaKey || false
      );
    });
  }
}
