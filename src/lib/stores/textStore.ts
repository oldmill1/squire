import { writable } from 'svelte/store';
import { showSaveNotification } from './saveNotificationStore';
import { moveCursorToEndOfLine, getCursorPosition, setCursorPosition } from './cursorStore';
import { currentLineStore } from './currentLineStore';

const STORAGE_KEY = 'squire-text';

export const textStore = writable<string[]>([]);

// Save to localStorage
export function saveToLocalStorage() {
  if (typeof window === 'undefined') return; // Skip during SSR
  
  let currentLines: string[] = [];
  textStore.subscribe(value => currentLines = value)();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentLines));
  
  // Show save notification
  showSaveNotification();
}

// Load from localStorage
export function loadFromLocalStorage() {
  if (typeof window === 'undefined') return false; // Skip during SSR
  
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const lines = JSON.parse(saved);
      if (Array.isArray(lines)) {
        textStore.set(lines);

        // Position cursor and current line at the end of the document
        const lastLineIndex = Math.max(0, lines.length - 1);
        const lastLineText = lines[lastLineIndex] ?? '';
        setCursorPosition(lastLineIndex, lastLineText.length);
        currentLineStore.set(lastLineIndex);

        return true;
      }
    } catch (e) {
      console.error('Failed to parse saved text:', e);
    }
  }
  return false;
}

export function appendText(char: string) {
  textStore.update(lines => {
    const cursor = getCursorPosition();
    
    if (lines.length === 0) {
      // No lines exist, create first line with the character
      moveCursorToEndOfLine(char);
      return [char];
    } else {
      // Insert character at cursor position
      const newLines = [...lines];
      const currentLine = newLines[cursor.line] || '';
      
      // Insert character at cursor column
      const beforeCursor = currentLine.slice(0, cursor.column);
      const afterCursor = currentLine.slice(cursor.column);
      newLines[cursor.line] = beforeCursor + char + afterCursor;
      
      // Update cursor position and sync currentLineStore
      moveCursorToEndOfLine(newLines[cursor.line]);
      currentLineStore.set(cursor.line);
      return newLines;
    }
  });
  saveToLocalStorage();
}

export function insertNewline() {
  textStore.update(lines => {
    const cursor = getCursorPosition();
    
    if (lines.length === 0) {
      // No lines exist, create an empty line
      moveCursorToEndOfLine('');
      return [''];
    } else {
      // Split current line at cursor position
      const newLines = [...lines];
      const currentLine = newLines[cursor.line] || '';
      
      // Split the line at cursor column
      const beforeCursor = currentLine.slice(0, cursor.column);
      const afterCursor = currentLine.slice(cursor.column);
      
      // Replace current line and add new line with the rest
      newLines[cursor.line] = beforeCursor;
      newLines.splice(cursor.line + 1, 0, afterCursor);
      
      // Move cursor to beginning of new line and sync currentLineStore
      const newCursorLine = cursor.line + 1;
      setCursorPosition(newCursorLine, 0);
      currentLineStore.set(newCursorLine);
      return newLines;
    }
  });
  saveToLocalStorage();
}

export function modifyLastLine(line: string) {
  textStore.update(lines => {
    if (lines.length === 0) {
      // No lines exist, create the first line
      moveCursorToEndOfLine(line);
      return [line];
    } else {
      // Modify the last line
      const newLines = [...lines];
      newLines[newLines.length - 1] = line;
      moveCursorToEndOfLine(line);
      return newLines;
    }
  });
  saveToLocalStorage();
}

export function appendLine(line: string) {
  textStore.update(lines => {
    const newLines = [...lines, line];
    moveCursorToEndOfLine(line);
    return newLines;
  });
  saveToLocalStorage();
}

export function deleteCharacter() {
  textStore.update(lines => {
    if (lines.length === 0) return [];
    
    const cursor = getCursorPosition();
    const newLines = [...lines];
    const currentLine = newLines[cursor.line] || '';
    
    if (cursor.column > 0) {
      // Delete character before cursor
      const beforeCursor = currentLine.slice(0, cursor.column - 1);
      const afterCursor = currentLine.slice(cursor.column);
      newLines[cursor.line] = beforeCursor + afterCursor;
      
      // Move cursor back one position and sync currentLineStore
      setCursorPosition(cursor.line, cursor.column - 1);
      currentLineStore.set(cursor.line);
    } else if (cursor.line > 0) {
      // At beginning of line, merge with previous line
      const previousLine = newLines[cursor.line - 1] || '';
      newLines[cursor.line - 1] = previousLine + currentLine;
      newLines.splice(cursor.line, 1);
      
      // Move cursor to end of previous line and sync currentLineStore
      const newCursorLine = cursor.line - 1;
      setCursorPosition(newCursorLine, previousLine.length);
      currentLineStore.set(newCursorLine);
    }
    
    return newLines;
  });
  saveToLocalStorage();
}

export function deleteForward() {
  // For now, this behaves the same as backspace
  // In a more complex implementation, this would consider cursor position
  deleteCharacter();
}

export function deleteLine(lineNumber: number) {
  textStore.update(lines => {
    if (lines.length === 0 || lineNumber < 1 || lineNumber > lines.length) {
      return lines; // Return unchanged if invalid line number
    }
    // Remove the specified line (lineNumber is 1-based, array is 0-based)
    return lines.filter((_, index) => index !== lineNumber - 1);
  });
  saveToLocalStorage();
}

export function deleteAllLines() {
  textStore.set([]);
  saveToLocalStorage();
}

export function deleteLinesRange(startLine: number, endLine: number) {
  textStore.update(lines => {
    if (lines.length === 0 || startLine < 1 || endLine < 1 || startLine > lines.length) {
      return lines; // Return unchanged if invalid range
    }
    // Adjust endLine if it's beyond the array length
    const adjustedEndLine = Math.min(endLine, lines.length);
    // Remove lines from startLine to endLine (inclusive, 1-based to 0-based)
    return lines.filter((_, index) => {
      const lineNumber = index + 1;
      return lineNumber < startLine || lineNumber > adjustedEndLine;
    });
  });
  saveToLocalStorage();
}

export function getText(): string {
  let currentLines: string[] = [];
  textStore.subscribe(value => currentLines = value)();
  return currentLines.join('\n');
}

export function getLines(): string[] {
  let currentLines: string[] = [];
  textStore.subscribe(value => currentLines = value)();
  return currentLines;
}
