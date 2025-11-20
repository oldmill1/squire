import { describe, it, expect, beforeEach } from 'vitest';
import { NormalMode } from '../src/lib/services/shortcuts/modes/NormalMode';
import { ShortcutManager } from '../src/lib/services/shortcuts/ShortcutManager';
import { textStore, getLines } from '../src/lib/stores/textStore';
import { cursorStore, getCursorPosition } from '../src/lib/stores/cursorStore';
import { currentLineStore } from '../src/lib/stores/currentLineStore';

describe('NormalMode - Horizontal Movement', () => {
  let normalMode: NormalMode;
  let shortcutManager: ShortcutManager;

  beforeEach(() => {
    // Reset all stores before each test
    textStore.set(['Hello world', 'Second line', 'Short']);
    cursorStore.set({ line: 0, col: 0, want_col: 0 });
    currentLineStore.set(0);
    
    // Create new instances for each test
    shortcutManager = new ShortcutManager();
    normalMode = new NormalMode(shortcutManager);
  });

  it('should move cursor right with "l"', () => {
    // Start at beginning of line
    cursorStore.set({ line: 0, col: 0, want_col: 0 });
    
    const shortcuts = normalMode.getShortcuts();
    const moveRightShortcut = shortcuts.find(s => s.key === 'l');
    
    expect(moveRightShortcut).toBeDefined();
    
    // Move right 3 times
    moveRightShortcut!.action();
    moveRightShortcut!.action();
    moveRightShortcut!.action();
    
    const cursor = getCursorPosition();
    expect(cursor.line).toBe(0);
    expect(cursor.col).toBe(3);
    expect(cursor.want_col).toBe(3);
  });

  it('should move cursor left with "h"', () => {
    // Start at position 5
    cursorStore.set({ line: 0, col: 5, want_col: 5 });
    
    const shortcuts = normalMode.getShortcuts();
    const moveLeftShortcut = shortcuts.find(s => s.key === 'h');
    
    expect(moveLeftShortcut).toBeDefined();
    
    // Move left 2 times
    moveLeftShortcut!.action();
    moveLeftShortcut!.action();
    
    const cursor = getCursorPosition();
    expect(cursor.line).toBe(0);
    expect(cursor.col).toBe(3);
    expect(cursor.want_col).toBe(3);
  });

  it('should not go beyond line length when moving right', () => {
    // Start near end of "Hello world" (length 11)
    cursorStore.set({ line: 0, col: 10, want_col: 10 });
    
    const shortcuts = normalMode.getShortcuts();
    const moveRightShortcut = shortcuts.find(s => s.key === 'l');
    
    // Try to move right multiple times
    moveRightShortcut!.action();
    moveRightShortcut!.action();
    moveRightShortcut!.action();
    
    const cursor = getCursorPosition();
    expect(cursor.line).toBe(0);
    expect(cursor.col).toBe(11); // Should stop at line length
    expect(cursor.want_col).toBe(11);
  });

  it('should not go below 0 when moving left', () => {
    // Start at beginning of line
    cursorStore.set({ line: 0, col: 0, want_col: 0 });
    
    const shortcuts = normalMode.getShortcuts();
    const moveLeftShortcut = shortcuts.find(s => s.key === 'h');
    
    // Try to move left multiple times
    moveLeftShortcut!.action();
    moveLeftShortcut!.action();
    moveLeftShortcut!.action();
    
    const cursor = getCursorPosition();
    expect(cursor.line).toBe(0);
    expect(cursor.col).toBe(0); // Should stay at 0
    expect(cursor.want_col).toBe(0);
  });

  it('should work correctly on different lines', () => {
    // Move to second line
    cursorStore.set({ line: 1, col: 3, want_col: 3 });
    currentLineStore.set(1);
    
    const shortcuts = normalMode.getShortcuts();
    const moveRightShortcut = shortcuts.find(s => s.key === 'l');
    const moveLeftShortcut = shortcuts.find(s => s.key === 'h');
    
    // Move right
    moveRightShortcut!.action();
    let cursor = getCursorPosition();
    expect(cursor.line).toBe(1);
    expect(cursor.col).toBe(4);
    
    // Move left
    moveLeftShortcut!.action();
    cursor = getCursorPosition();
    expect(cursor.line).toBe(1);
    expect(cursor.col).toBe(3);
  });

  it('should handle empty lines correctly', () => {
    // Add an empty line and move to it
    textStore.set(['Hello world', '', 'Third line']);
    cursorStore.set({ line: 1, col: 0, want_col: 0 });
    currentLineStore.set(1);
    
    const shortcuts = normalMode.getShortcuts();
    const moveRightShortcut = shortcuts.find(s => s.key === 'l');
    const moveLeftShortcut = shortcuts.find(s => s.key === 'h');
    
    // Try to move right on empty line
    moveRightShortcut!.action();
    let cursor = getCursorPosition();
    expect(cursor.line).toBe(1);
    expect(cursor.col).toBe(0); // Should stay at 0
    
    // Try to move left on empty line
    moveLeftShortcut!.action();
    cursor = getCursorPosition();
    expect(cursor.line).toBe(1);
    expect(cursor.col).toBe(0); // Should stay at 0
  });

  it('should work on short lines', () => {
    // Move to "Short" line (length 5)
    cursorStore.set({ line: 2, col: 4, want_col: 4 });
    currentLineStore.set(2);
    
    const shortcuts = normalMode.getShortcuts();
    const moveRightShortcut = shortcuts.find(s => s.key === 'l');
    
    // Move right - should stop at length 5
    moveRightShortcut!.action();
    moveRightShortcut!.action();
    
    const cursor = getCursorPosition();
    expect(cursor.line).toBe(2);
    expect(cursor.col).toBe(5); // Should stop at line length
    expect(cursor.want_col).toBe(5);
  });
});
