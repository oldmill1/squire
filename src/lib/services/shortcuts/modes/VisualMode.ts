import type { ModeHandler, Mode } from '../types';
import type { Shortcut } from '../../keyboardService';
import { keyboardService } from '../../keyboardService';
import { ShortcutManager } from '../ShortcutManager';
import { getCursorPosition, setCursorPosition } from '$lib/stores/cursorStore';
import { getLines } from '$lib/stores/textStore';
import { clearVisualSelection, updateVisualSelection, getVisualState } from '$lib/stores/visualStore';

export class VisualMode implements ModeHandler {
  mode: Mode = 'visual_char';
  private manager: ShortcutManager;

  constructor(manager: ShortcutManager) {
    this.manager = manager;
  }

  enter(): void {
    // Clear any existing character/special key handlers
    keyboardService.clearCharacterInputHandler();
    keyboardService.clearSpecialKeyHandler();

    // Register visual mode shortcuts
    this.registerShortcuts();
  }

  exit(): void {
    // Clear selection when exiting visual mode
    clearVisualSelection();
    // Remove all visual mode shortcuts
    this.removeShortcuts();
  }

  getShortcuts(): Shortcut[] {
    return [
      // Navigation shortcuts that extend selection
      {
        key: 'h',
        action: () => {
          // Move cursor left and extend selection
          const cursor = getCursorPosition();
          const lines = getLines();
          const currentLine = lines[cursor.line] || '';
          
          const newCol = Math.max(0, cursor.col - 1);
          setCursorPosition(cursor.line, newCol);
          updateVisualSelection({ line: cursor.line, col: newCol });
        },
        description: 'Move cursor left and extend selection'
      },
      {
        key: 'l',
        action: () => {
          // Move cursor right and extend selection
          const cursor = getCursorPosition();
          const lines = getLines();
          const currentLine = lines[cursor.line] || '';
          
          const newCol = Math.min(currentLine.length, cursor.col + 1);
          setCursorPosition(cursor.line, newCol);
          updateVisualSelection({ line: cursor.line, col: newCol });
        },
        description: 'Move cursor right and extend selection'
      },
      {
        key: 'k',
        action: () => {
          // Move cursor up and extend selection
          const cursor = getCursorPosition();
          const lines = getLines();
          const newLine = Math.max(0, cursor.line - 1);
          const targetLine = lines[newLine] || '';
          const newCol = Math.min(cursor.col, targetLine.length);
          
          setCursorPosition(newLine, newCol);
          updateVisualSelection({ line: newLine, col: newCol });
        },
        description: 'Move cursor up and extend selection'
      },
      {
        key: 'j',
        action: () => {
          // Move cursor down and extend selection
          const cursor = getCursorPosition();
          const lines = getLines();
          const maxLine = Math.max(0, lines.length - 1);
          const newLine = Math.min(maxLine, cursor.line + 1);
          const targetLine = lines[newLine] || '';
          const newCol = Math.min(cursor.col, targetLine.length);
          
          setCursorPosition(newLine, newCol);
          updateVisualSelection({ line: newLine, col: newCol });
        },
        description: 'Move cursor down and extend selection'
      },
      // Exit visual mode
      {
        key: 'Escape',
        action: () => {
          this.manager.switchToMode('normal');
        },
        description: 'Exit visual mode and return to normal'
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
