import { describe, it, expect, beforeEach } from 'vitest';
import { cursorStore, getCursorPosition, setCursorPosition } from '../src/lib/stores/cursorStore';
import { textStore, loadFromLocalStorage } from '../src/lib/stores/textStore';
import { currentLineStore } from '../src/lib/stores/currentLineStore';

describe('Cursor Model', () => {
  beforeEach(() => {
    // Reset all stores before each test
    textStore.set([]);
    cursorStore.set({ line: 0, col: 0, want_col: 0 });
    currentLineStore.set(0);
  });

  it('should have line, col, and want_col properties', () => {
    const cursor = getCursorPosition();
    expect(cursor).toHaveProperty('line');
    expect(cursor).toHaveProperty('col');
    expect(cursor).toHaveProperty('want_col');
  });

  it('should initialize cursor to end of last line when loading from localStorage', () => {
    // Simulate loading a document with existing text
    const testLines = ['Hello world,', 'How is it going?', 'iowe'];
    textStore.set(testLines);
    
    // Simulate the loadFromLocalStorage cursor initialization
    if (testLines.length > 0) {
      const lastLineIndex = testLines.length - 1;
      const lastLineText = testLines[lastLineIndex] || '';
      setCursorPosition(lastLineIndex, lastLineText.length);
      currentLineStore.set(lastLineIndex);
    }
    
    const cursor = getCursorPosition();
    expect(cursor.line).toBe(2); // Last line (0-based)
    expect(cursor.col).toBe(4);  // Length of "iowe"
    expect(cursor.want_col).toBe(4); // Should match col
  });

  it('should preserve want_col when changing lines but not when explicitly setting column', () => {
    // Set initial cursor position
    setCursorPosition(0, 5); // This should set both col and want_col to 5
    let cursor = getCursorPosition();
    expect(cursor.col).toBe(5);
    expect(cursor.want_col).toBe(5);
    
    // Change line using setCursorLine (should preserve want_col)
    cursorStore.set({ line: 1, col: 3, want_col: 5 }); // Simulate moving to shorter line
    cursor = getCursorPosition();
    expect(cursor.line).toBe(1);
    expect(cursor.col).toBe(3);  // Actual position limited by line length
    expect(cursor.want_col).toBe(5); // Preferred column preserved
  });

  it('should handle empty document correctly', () => {
    // Empty document should have cursor at 0,0
    const cursor = getCursorPosition();
    expect(cursor.line).toBe(0);
    expect(cursor.col).toBe(0);
    expect(cursor.want_col).toBe(0);
  });
});
