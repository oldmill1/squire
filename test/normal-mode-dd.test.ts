import { describe, it, expect, beforeEach } from 'vitest';
import { NormalMode } from '../src/lib/services/shortcuts/modes/NormalMode';
import { ShortcutManager } from '../src/lib/services/shortcuts/ShortcutManager';
import { textStore, getLines } from '../src/lib/stores/textStore';
import { cursorStore, getCursorPosition } from '../src/lib/stores/cursorStore';
import { currentLineStore } from '../src/lib/stores/currentLineStore';
import { getRegister } from '../src/lib/stores/registerStore';
import { get } from 'svelte/store';

describe('NormalMode - dd command', () => {
  let normalMode: NormalMode;
  let shortcutManager: ShortcutManager;

  beforeEach(() => {
    // Reset all stores before each test
    textStore.set(['line 1', 'line 2', 'line 3']);
    cursorStore.set({ line: 0, column: 0 });
    currentLineStore.set(0);
    
    // Create new instances for each test
    shortcutManager = new ShortcutManager();
    normalMode = new NormalMode(shortcutManager);
  });

  it('should delete current line when dd is pressed', () => {
    // Start at line 0
    cursorStore.set({ line: 0, column: 0 });
    currentLineStore.set(0);
    
    // Get the shortcuts
    const shortcuts = normalMode.getShortcuts();
    const ddShortcut = shortcuts.find(s => s.key === 'd' && s.description?.includes('Delete current line'));
    
    expect(ddShortcut).toBeDefined();
    
    // Simulate first 'd' press (should set pending command)
    ddShortcut!.action();
    
    // Simulate second 'd' press (should execute delete)
    ddShortcut!.action();
    
    // Check that line 0 was deleted
    const lines = getLines();
    expect(lines).toEqual(['line 2', 'line 3']);
    
    // Check that cursor moved to the "next logical line" (which is now line 0)
    const cursor = getCursorPosition();
    expect(cursor.line).toBe(0);
    expect(cursor.column).toBe(0);
    
    // Check that currentLineStore is updated
    expect(get(currentLineStore)).toBe(0);
  });

  it('should delete middle line and move cursor to same line index', () => {
    // Start at line 1
    cursorStore.set({ line: 1, column: 5 });
    currentLineStore.set(1);
    
    const shortcuts = normalMode.getShortcuts();
    const ddShortcut = shortcuts.find(s => s.key === 'd' && s.description?.includes('Delete current line'));
    
    // Execute dd command
    ddShortcut!.action();
    ddShortcut!.action();
    
    // Check that line 1 was deleted
    const lines = getLines();
    expect(lines).toEqual(['line 1', 'line 3']);
    
    // Cursor should be at line 1 (where line 2 used to be)
    const cursor = getCursorPosition();
    expect(cursor.line).toBe(1);
    expect(cursor.column).toBe(0);
  });

  it('should delete last line and move cursor to previous line', () => {
    // Start at last line (line 2)
    cursorStore.set({ line: 2, column: 3 });
    currentLineStore.set(2);
    
    const shortcuts = normalMode.getShortcuts();
    const ddShortcut = shortcuts.find(s => s.key === 'd' && s.description?.includes('Delete current line'));
    
    // Execute dd command
    ddShortcut!.action();
    ddShortcut!.action();
    
    // Check that last line was deleted
    const lines = getLines();
    expect(lines).toEqual(['line 1', 'line 2']);
    
    // Cursor should move to previous line (now line 1)
    const cursor = getCursorPosition();
    expect(cursor.line).toBe(1);
    expect(cursor.column).toBe(0);
  });

  it('should handle deleting the only line', () => {
    // Start with only one line
    textStore.set(['only line']);
    cursorStore.set({ line: 0, column: 2 });
    currentLineStore.set(0);
    
    const shortcuts = normalMode.getShortcuts();
    const ddShortcut = shortcuts.find(s => s.key === 'd' && s.description?.includes('Delete current line'));
    
    // Execute dd command
    ddShortcut!.action();
    ddShortcut!.action();
    
    // Check that the line was deleted
    const lines = getLines();
    expect(lines).toEqual([]);
    
    // Cursor should be at 0,0
    const cursor = getCursorPosition();
    expect(cursor.line).toBe(0);
    expect(cursor.column).toBe(0);
  });

  it('should store deleted line in register', () => {
    // Start at line 1
    cursorStore.set({ line: 1, column: 0 });
    currentLineStore.set(1);
    
    const shortcuts = normalMode.getShortcuts();
    const ddShortcut = shortcuts.find(s => s.key === 'd' && s.description?.includes('Delete current line'));
    
    // Execute dd command
    ddShortcut!.action();
    ddShortcut!.action();
    
    // Check that the deleted line is stored in register
    const register = getRegister();
    expect(register.content).toBe('line 2\n');
    expect(register.type).toBe('line');
  });

  it('should not delete line on single d press', () => {
    const initialLines = ['line 1', 'line 2', 'line 3'];
    
    const shortcuts = normalMode.getShortcuts();
    const ddShortcut = shortcuts.find(s => s.key === 'd' && s.description?.includes('Delete current line'));
    
    // Press 'd' only once
    ddShortcut!.action();
    
    // Lines should remain unchanged
    const lines = getLines();
    expect(lines).toEqual(initialLines);
  });

  it('should clear pending command when other keys are pressed', () => {
    const shortcuts = normalMode.getShortcuts();
    const ddShortcut = shortcuts.find(s => s.key === 'd' && s.description?.includes('Delete current line'));
    const moveUpShortcut = shortcuts.find(s => s.key === 'k');
    
    // Press 'd' to set pending command
    ddShortcut!.action();
    
    // Press 'k' to move up (should clear pending command)
    moveUpShortcut!.action();
    
    // Press 'd' again - should not delete line (pending command was cleared)
    ddShortcut!.action();
    
    // Lines should remain unchanged
    const lines = getLines();
    expect(lines).toEqual(['line 1', 'line 2', 'line 3']);
  });

  it('should paste line after current with p command', () => {
    // First delete a line to store it in register
    cursorStore.set({ line: 1, column: 0 });
    currentLineStore.set(1);
    
    const shortcuts = normalMode.getShortcuts();
    const ddShortcut = shortcuts.find(s => s.key === 'd' && s.description?.includes('Delete current line'));
    const pasteShortcut = shortcuts.find(s => s.key === 'p');
    
    // Delete line 2
    ddShortcut!.action();
    ddShortcut!.action();
    
    // Move to line 0
    cursorStore.set({ line: 0, column: 0 });
    currentLineStore.set(0);
    
    // Paste after current line
    pasteShortcut!.action();
    
    // Check that line was pasted after line 0
    const lines = getLines();
    expect(lines).toEqual(['line 1', 'line 2', 'line 3']);
    
    // Cursor should be on the pasted line
    const cursor = getCursorPosition();
    expect(cursor.line).toBe(1);
    expect(cursor.column).toBe(0);
  });
});
