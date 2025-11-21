import type { ModeHandler, Mode } from '../types';
import type { Shortcut } from '../../keyboardService';
import { keyboardService } from '../../keyboardService';
import { FontShortcuts } from '../categories/FontShortcuts';
import { SystemShortcuts } from '../categories/SystemShortcuts';
import { ShortcutManager } from '../ShortcutManager';
import { currentLineStore } from '$lib/stores/currentLineStore';
import { textStore, getLines, deleteCurrentLine, pasteLineAfterCurrent, saveCursorPosition } from '$lib/stores/textStore';
import { setCursorLine, setCursorColumn, getCursorPosition, setCursorWantCol, moveCursorToLineEnd, setCursorPosition } from '$lib/stores/cursorStore';
import { startVisualSelection } from '$lib/stores/visualStore';

export class NormalMode implements ModeHandler {
  mode: Mode = 'normal';
  private manager: ShortcutManager;
  private pendingCommand: string | null = null;
  private commandTimeout: number | null = null;

  constructor(manager: ShortcutManager) {
    this.manager = manager;
  }

  enter(): void {
    // Clear any existing character/special key handlers
    keyboardService.clearCharacterInputHandler();
    keyboardService.clearSpecialKeyHandler();

    // Register all normal mode shortcuts
    this.registerShortcuts();
  }

  exit(): void {
    // Clear any pending command
    this.clearPendingCommand();
    // Remove all normal mode shortcuts
    this.removeShortcuts();
  }

  private clearPendingCommand(): void {
    this.pendingCommand = null;
    if (this.commandTimeout) {
      clearTimeout(this.commandTimeout);
      this.commandTimeout = null;
    }
  }

  private setPendingCommand(command: string): void {
    this.clearPendingCommand();
    this.pendingCommand = command;
    // Set timeout to clear pending command after 1 second
    this.commandTimeout = setTimeout(() => {
      this.clearPendingCommand();
    }, 1000) as unknown as number;
  }

  getShortcuts(): Shortcut[] {
    return [
      ...FontShortcuts.getShortcuts(),
      ...SystemShortcuts.getShortcuts(),
      // Mode switching shortcuts
      {
        key: 'i',
        action: () => {
          this.clearPendingCommand();
          this.manager.switchToMode('insert');
        },
        description: 'Switch to insert mode'
      },
      {
        key: ':',
        shiftKey: true,
        action: () => {
          this.clearPendingCommand();
          this.manager.switchToMode('command');
        },
        description: 'Switch to command mode'
      },
      {
        key: 'v',
        action: () => {
          this.clearPendingCommand();
          const cursor = getCursorPosition();
          startVisualSelection('char', { line: cursor.line, col: cursor.col });
          this.manager.switchToMode('visual_char');
        },
        description: 'Enter character-wise visual mode'
      },
      {
        key: 'Escape',
        action: () => {
          this.clearPendingCommand();
          // Already in normal mode, but ensure we're here
          this.manager.switchToMode('normal');
        },
        description: 'Ensure normal mode'
      },
      {
        key: 'k',
        action: async () => {
          this.clearPendingCommand();
          // Navigate up: decrease current line by 1, but not below 0
          const lines = getLines();
          currentLineStore.update(currentLine => {
            const newLine = Math.max(0, currentLine - 1);
            // Update cursor line and preserve want_col
            setCursorLine(newLine);
            
            // Move cursor to appropriate column based on line length
            const targetLine = lines[newLine] || '';
            moveCursorToLineEnd(targetLine, true); // preserve want_col
            
            return newLine;
          });
          // Save cursor position after movement
          await saveCursorPosition();
        },
        description: 'Move current line up'
      },
      {
        key: 'j',
        action: async () => {
          this.clearPendingCommand();
          // Navigate down: increase current line by 1, but not beyond available lines
          const lines = getLines();
          currentLineStore.update(currentLine => {
            const maxLine = Math.max(0, lines.length - 1);
            const newLine = Math.min(maxLine, currentLine + 1);
            // Update cursor line and preserve want_col
            setCursorLine(newLine);
            
            // Move cursor to appropriate column based on line length
            const targetLine = lines[newLine] || '';
            moveCursorToLineEnd(targetLine, true); // preserve want_col
            
            return newLine;
          });
          // Save cursor position after movement
          await saveCursorPosition();
        },
        description: 'Move current line down'
      },
      {
        key: 'h',
        action: async () => {
          this.clearPendingCommand();
          // Move cursor left
          const cursor = getCursorPosition();
          const lines = getLines();
          const currentLine = lines[cursor.line] || '';
          
          // Calculate new column position, don't go below 0
          const newCol = Math.max(0, cursor.col - 1);
          setCursorPosition(cursor.line, newCol);
          currentLineStore.set(cursor.line);
          // Save cursor position after movement
          await saveCursorPosition();
        },
        description: 'Move cursor left'
      },
      {
        key: 'l',
        action: async () => {
          this.clearPendingCommand();
          // Move cursor right
          const cursor = getCursorPosition();
          const lines = getLines();
          const currentLine = lines[cursor.line] || '';
          
          // Calculate new column position, don't go beyond line length
          const newCol = Math.min(currentLine.length, cursor.col + 1);
          setCursorPosition(cursor.line, newCol);
          currentLineStore.set(cursor.line);
          // Save cursor position after movement
          await saveCursorPosition();
        },
        description: 'Move cursor right'
      },
      {
        key: 'd',
        action: () => {
          if (this.pendingCommand === 'd') {
            // Second 'd' press - execute delete line command
            this.clearPendingCommand();
            deleteCurrentLine();
          } else {
            // First 'd' press - set pending command
            this.setPendingCommand('d');
          }
        },
        description: 'Delete current line (dd)'
      },
      {
        key: 'p',
        action: () => {
          this.clearPendingCommand();
          pasteLineAfterCurrent();
        },
        description: 'Paste line after current'
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
