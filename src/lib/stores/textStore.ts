import { writable } from 'svelte/store';
import { showSaveNotification } from './saveNotificationStore';
import { moveCursorToEndOfLine } from './cursorStore';

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
    if (lines.length === 0) {
      // No lines exist, create first line with the character
      return [char];
    } else {
      // Append to the last line
      const newLines = [...lines];
      newLines[newLines.length - 1] += char;
      // Update cursor position to end of the modified line
      moveCursorToEndOfLine(newLines[newLines.length - 1]);
      return newLines;
    }
  });
  saveToLocalStorage();
}

export function insertNewline() {
  textStore.update(lines => {
    if (lines.length === 0) {
      // No lines exist, create an empty line
      moveCursorToEndOfLine('');
      return [''];
    } else {
      // Add a new empty line
      moveCursorToEndOfLine('');
      return [...lines, ''];
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
    
    const newLines = [...lines];
    const lastLine = newLines[newLines.length - 1];
    
    if (lastLine.length > 0) {
      // Remove last character from current line
      newLines[newLines.length - 1] = lastLine.slice(0, -1);
      // Update cursor position to end of the modified line
      moveCursorToEndOfLine(newLines[newLines.length - 1]);
    } else if (newLines.length > 1) {
      // Remove the empty line
      newLines.pop();
      // Update cursor position to end of the new last line
      moveCursorToEndOfLine(newLines[newLines.length - 1]);
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
