import { describe, it, expect, beforeEach } from 'vitest';
import { textStore, deleteAllLines, loadFromLocalStorage, getLines } from '../src/lib/stores/textStore';
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

describe('Persistence Bug Regression Test', () => {
  beforeEach(() => {
    // Reset stores and localStorage before each test
    textStore.set([]);
    setCursorPosition(0, 0);
    currentLineStore.set(0);
    localStorageMock.clear();
  });

  it('should not create blank lines after %d and refresh (regression test)', () => {
    // Simulate the original bug scenario
    
    // 1. User has some content
    textStore.set(['line 1', 'line 2', 'line 3', 'line 4', 'line 5']);
    setCursorPosition(4, 3); // Cursor somewhere in the content
    currentLineStore.set(4);
    
    // 2. User executes %d (delete all lines)
    deleteAllLines();
    
    // 3. Verify content is actually deleted
    expect(getLines()).toEqual([]);
    
    // 4. Verify cursor is properly reset
    const cursorAfterDelete = getCursorPosition();
    expect(cursorAfterDelete.line).toBe(0);
    expect(cursorAfterDelete.col).toBe(0);
    
    // 5. Simulate page refresh by loading from localStorage
    textStore.set(['dummy data to force reload']); // Clear current store
    const loaded = loadFromLocalStorage();
    
    // 6. Verify loaded data is correct (no blank lines)
    expect(loaded).toBe(true);
    expect(getLines()).toEqual([]);
    
    // 7. Verify cursor is still properly positioned after load
    const cursorAfterLoad = getCursorPosition();
    expect(cursorAfterLoad.line).toBe(0);
    expect(cursorAfterLoad.col).toBe(0);
    
    // 8. Verify localStorage contains correct data (empty array, not array of blank strings)
    const savedData = localStorageMock.getItem('squire-text');
    expect(savedData).toBe('[]');
    
    // Parse and verify it's actually an empty array, not array with empty strings
    const parsed = JSON.parse(savedData!);
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBe(0);
  });

  it('should handle multiple delete operations correctly', () => {
    // Test multiple delete operations to ensure no corruption
    
    // Start with content
    textStore.set(['a', 'b', 'c', 'd', 'e']);
    
    // Delete all lines
    deleteAllLines();
    expect(getLines()).toEqual([]);
    
    // Add new content
    textStore.set(['new line 1', 'new line 2']);
    
    // Delete all lines again
    deleteAllLines();
    expect(getLines()).toEqual([]);
    
    // Simulate refresh
    textStore.set(['dummy']);
    loadFromLocalStorage();
    
    // Should still be empty
    expect(getLines()).toEqual([]);
    
    // Cursor should be at 0,0
    const cursor = getCursorPosition();
    expect(cursor.line).toBe(0);
    expect(cursor.col).toBe(0);
  });

  it('should not accumulate empty lines in localStorage', () => {
    // Test that repeated operations don't create corrupted localStorage data
    
    const initialContent = ['line 1', 'line 2', 'line 3'];
    textStore.set(initialContent);
    
    // Perform delete and recreate cycle multiple times
    for (let i = 0; i < 5; i++) {
      // Delete all
      deleteAllLines();
      
      // Verify localStorage is clean
      const saved = localStorageMock.getItem('squire-text');
      const parsed = JSON.parse(saved!);
      expect(parsed).toEqual([]);
      
      // Recreate content
      textStore.set([...initialContent, `iteration ${i}`]);
    }
    
    // Final delete
    deleteAllLines();
    
    // Verify final state is clean
    const finalSaved = localStorageMock.getItem('squire-text');
    const finalParsed = JSON.parse(finalSaved!);
    expect(finalParsed).toEqual([]);
    expect(finalParsed.length).toBe(0);
  });
});
