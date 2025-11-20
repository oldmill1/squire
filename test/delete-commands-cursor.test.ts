import { describe, it, expect, beforeEach } from 'vitest';
import { textStore, deleteAllLines, deleteLine, deleteLinesRange, loadFromLocalStorage, getLines } from '../src/lib/stores/textStore';
import { getCursorPosition, setCursorPosition } from '../src/lib/stores/cursorStore';
import { currentLineStore } from '../src/lib/stores/currentLineStore';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Delete Commands - Cursor Positioning', () => {
  beforeEach(() => {
    // Reset stores before each test
    textStore.set([]);
    setCursorPosition(0, 0);
    currentLineStore.set(0);
    localStorageMock.clear();
  });

  describe('deleteAllLines', () => {
    it('should reset cursor to 0,0 when deleting all lines', () => {
      // Setup: Create some lines and move cursor
      textStore.set(['line 1', 'line 2', 'line 3']);
      setCursorPosition(2, 5); // Cursor on third line
      currentLineStore.set(2);

      // Execute deleteAllLines
      deleteAllLines();

      // Verify cursor is reset to 0,0
      const cursor = getCursorPosition();
      expect(cursor.line).toBe(0);
      expect(cursor.col).toBe(0);
      expect(getLines()).toEqual([]);
    });

    it('should persist cursor reset after localStorage load', () => {
      // Setup: Create lines and delete them
      textStore.set(['line 1', 'line 2']);
      deleteAllLines();

      // Simulate page refresh by loading from localStorage
      textStore.set(['dummy']); // Clear current store
      const loaded = loadFromLocalStorage();

      expect(loaded).toBe(true);
      const cursor = getCursorPosition();
      expect(cursor.line).toBe(0);
      expect(cursor.col).toBe(0);
      expect(getLines()).toEqual([]);
    });
  });

  describe('deleteLine', () => {
    it('should adjust cursor when deleting current line', () => {
      // Setup
      textStore.set(['line 1', 'line 2', 'line 3']);
      setCursorPosition(1, 3); // Cursor on second line
      currentLineStore.set(1);

      // Delete the current line (line 2)
      deleteLine(2);

      // Cursor should move to line that took the place (line 2, which was originally line 3)
      const cursor = getCursorPosition();
      expect(cursor.line).toBe(1);
      expect(cursor.col).toBe(0);
      expect(getLines()).toEqual(['line 1', 'line 3']);
    });

    it('should adjust cursor when deleting line before current line', () => {
      // Setup
      textStore.set(['line 1', 'line 2', 'line 3', 'line 4']);
      setCursorPosition(3, 2); // Cursor on fourth line
      currentLineStore.set(3);

      // Delete line 2
      deleteLine(2);

      // Cursor should move up one line
      const cursor = getCursorPosition();
      expect(cursor.line).toBe(2);
      expect(cursor.col).toBe(2); // Column should be preserved
      expect(getLines()).toEqual(['line 1', 'line 3', 'line 4']);
    });

    it('should handle deleting last line when cursor is on it', () => {
      // Setup
      textStore.set(['line 1', 'line 2', 'line 3']);
      setCursorPosition(2, 4); // Cursor on last line
      currentLineStore.set(2);

      // Delete last line
      deleteLine(3);

      // Cursor should move to previous line
      const cursor = getCursorPosition();
      expect(cursor.line).toBe(1);
      expect(cursor.col).toBe(0);
      expect(getLines()).toEqual(['line 1', 'line 2']);
    });

    it('should reset cursor when deleting the only line', () => {
      // Setup
      textStore.set(['only line']);
      setCursorPosition(0, 5);
      currentLineStore.set(0);

      // Delete the only line
      deleteLine(1);

      // Cursor should reset to 0,0
      const cursor = getCursorPosition();
      expect(cursor.line).toBe(0);
      expect(cursor.col).toBe(0);
      expect(getLines()).toEqual([]);
    });
  });

  describe('deleteLinesRange', () => {
    it('should adjust cursor when deleting range containing current line', () => {
      // Setup
      textStore.set(['line 1', 'line 2', 'line 3', 'line 4', 'line 5']);
      setCursorPosition(2, 3); // Cursor on line 3
      currentLineStore.set(2);

      // Delete lines 2-4
      deleteLinesRange(2, 4);

      // Cursor should move to line that took place of first deleted line
      const cursor = getCursorPosition();
      expect(cursor.line).toBe(1); // Line 2 (which was originally line 1)
      expect(cursor.col).toBe(0);
      expect(getLines()).toEqual(['line 1', 'line 5']);
    });

    it('should adjust cursor when deleting range before current line', () => {
      // Setup
      textStore.set(['line 1', 'line 2', 'line 3', 'line 4', 'line 5']);
      setCursorPosition(4, 2); // Cursor on line 5
      currentLineStore.set(4);

      // Delete lines 1-2
      deleteLinesRange(1, 2);

      // Cursor should move up by 2 lines
      const cursor = getCursorPosition();
      expect(cursor.line).toBe(2); // Was 4, now 2
      expect(cursor.col).toBe(2);
      expect(getLines()).toEqual(['line 3', 'line 4', 'line 5']);
    });

    it('should reset cursor when deleting all lines via range', () => {
      // Setup
      textStore.set(['line 1', 'line 2', 'line 3']);
      setCursorPosition(1, 2);
      currentLineStore.set(1);

      // Delete all lines
      deleteLinesRange(1, 3);

      // Cursor should reset to 0,0
      const cursor = getCursorPosition();
      expect(cursor.line).toBe(0);
      expect(cursor.col).toBe(0);
      expect(getLines()).toEqual([]);
    });
  });
});
