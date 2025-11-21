import { writable, get } from 'svelte/store';
import { showSaveNotification } from './saveNotificationStore';
import { moveCursorToEndOfLine, getCursorPosition, setCursorPosition, moveCursorToLineEnd } from './cursorStore';
import { cursorStore } from './cursorStore';
import { currentLineStore } from './currentLineStore';
import { setRegister, getRegister } from './registerStore';
import { settingsService } from '../services/settingsService';
import { activeDocumentStore } from './activeDocumentStore';
import { documentService } from '../services/documentService';
import { debouncedSave } from './debouncedSaveStore';

const STORAGE_KEY = 'squire-text';

export const textStore = writable<string[]>([]);

// Save to PouchDB (or localStorage as fallback)
export async function saveToLocalStorage() {
  if (typeof window === 'undefined') return; // Skip during SSR
  
  // Use debounced save to prevent conflicts
  debouncedSave();
}

// Load from localStorage (text only, not cursor position)
export function loadFromLocalStorage() {
  if (typeof window === 'undefined') return false; // Skip during SSR
  
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const lines = JSON.parse(saved);
      if (Array.isArray(lines)) {
        textStore.set(lines);

        // Set cursor to end of file initially (cursor position will be restored later if PouchDB is available)
        const lastLineIndex = lines.length - 1;
        const lastLineText = lines[lastLineIndex] || '';
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

// Load cursor position from PouchDB (call this after PouchDB is ready)
export async function loadCursorPositionAfterDBReady() {
  try {
    const lines = getLines();
    if (lines.length === 0) return;

    const savedCursor = await loadCursorPosition();
    
    if (savedCursor) {
      // Validate that the saved cursor position is still valid
      if (savedCursor.line >= 0 && savedCursor.line < lines.length) {
        const targetLine = lines[savedCursor.line] || '';
        const maxCol = targetLine.length;
        
        // Clamp column to line length and set cursor position
        const validCol = Math.min(savedCursor.col, maxCol);
        const validWantCol = Math.min(savedCursor.want_col || 0, maxCol);
        
        setCursorPosition(savedCursor.line, validCol);
        // Set want_col separately if it's different from col
        if (validWantCol !== validCol) {
          cursorStore.update(position => ({ 
            ...position, 
            want_col: validWantCol
          }));
        }
        currentLineStore.set(savedCursor.line);
      } else {
        // Saved line doesn't exist, keep cursor at end of file
        const lastLineIndex = lines.length - 1;
        const lastLineText = lines[lastLineIndex] || '';
        setCursorPosition(lastLineIndex, lastLineText.length);
        currentLineStore.set(lastLineIndex);
      }
    }
  } catch (error) {
    console.error('Failed to load cursor position after DB ready:', error);
  }
}

export async function appendText(char: string) {
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
      const beforeCursor = currentLine.slice(0, cursor.col);
      const afterCursor = currentLine.slice(cursor.col);
      newLines[cursor.line] = beforeCursor + char + afterCursor;
      
      // Update cursor position - increment column by 1 and update want_col
      const newCol = cursor.col + 1;
      setCursorPosition(cursor.line, newCol);
      currentLineStore.set(cursor.line);
      return newLines;
    }
  });
  await saveToLocalStorage();
}

export async function insertNewline() {
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
      const beforeCursor = currentLine.slice(0, cursor.col);
      const afterCursor = currentLine.slice(cursor.col);
      
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
  await saveToLocalStorage();
}

export async function modifyLastLine(line: string) {
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
  await saveToLocalStorage();
}

export async function appendLine(line: string) {
  textStore.update(lines => {
    const newLines = [...lines, line];
    moveCursorToEndOfLine(line);
    return newLines;
  });
  await saveToLocalStorage();
}

export async function deleteCharacter() {
  textStore.update(lines => {
    if (lines.length === 0) return [];
    
    const cursor = getCursorPosition();
    const newLines = [...lines];
    const currentLine = newLines[cursor.line] || '';
    
    if (cursor.col > 0) {
      // Delete character before cursor
      const beforeCursor = currentLine.slice(0, cursor.col - 1);
      const afterCursor = currentLine.slice(cursor.col);
      newLines[cursor.line] = beforeCursor + afterCursor;
      
      // Move cursor back one position and sync currentLineStore
      const newCol = cursor.col - 1;
      setCursorPosition(cursor.line, newCol);
      currentLineStore.set(cursor.line);
    } else if (cursor.line > 0) {
      // At beginning of line, merge with previous line
      const previousLine = newLines[cursor.line - 1] || '';
      newLines[cursor.line - 1] = previousLine + currentLine;
      newLines.splice(cursor.line, 1);
      
      // Move cursor to end of previous line and sync currentLineStore
      const newCursorLine = cursor.line - 1;
      const newCol = previousLine.length;
      setCursorPosition(newCursorLine, newCol);
      currentLineStore.set(newCursorLine);
    }
    
    return newLines;
  });
  await saveToLocalStorage();
}

export async function deleteForward() {
  // For now, this behaves the same as backspace
  // In a more complex implementation, this would consider cursor position
  await deleteCharacter();
}

export async function deleteLine(lineNumber: number) {
  textStore.update(lines => {
    if (lines.length === 0 || lineNumber < 1 || lineNumber > lines.length) {
      return lines; // Return unchanged if invalid line number
    }
    
    const cursor = getCursorPosition();
    const newLines = lines.filter((_, index) => index !== lineNumber - 1);
    
    // Adjust cursor position if necessary
    if (newLines.length === 0) {
      // All lines deleted, reset cursor to 0,0
      setCursorPosition(0, 0);
      currentLineStore.set(0);
    } else if (cursor.line === lineNumber - 1) {
      // Cursor was on the deleted line
      const newCursorLine = Math.min(lineNumber - 1, newLines.length - 1);
      setCursorPosition(newCursorLine, 0);
      currentLineStore.set(newCursorLine);
    } else if (cursor.line > lineNumber - 1) {
      // Cursor was after the deleted line, adjust its position
      const newCursorLine = cursor.line - 1;
      setCursorPosition(newCursorLine, Math.min(cursor.col, newLines[newCursorLine]?.length || 0));
      currentLineStore.set(newCursorLine);
    }
    
    return newLines;
  });
  await saveToLocalStorage();
}

export async function deleteAllLines() {
  textStore.set([]);
  // Reset cursor position to 0,0 when all lines are deleted
  setCursorPosition(0, 0);
  currentLineStore.set(0);
  await saveToLocalStorage();
}

export async function deleteLinesRange(startLine: number, endLine: number) {
  textStore.update(lines => {
    if (lines.length === 0 || startLine < 1 || endLine < 1 || startLine > lines.length) {
      return lines; // Return unchanged if invalid range
    }
    
    const cursor = getCursorPosition();
    const newLines = lines.filter((_, index) => {
      const lineNumber = index + 1;
      return lineNumber < startLine || lineNumber > endLine;
    });
    
    // Adjust cursor position if necessary
    if (newLines.length === 0) {
      // All lines deleted, reset cursor to 0,0
      setCursorPosition(0, 0);
      currentLineStore.set(0);
    } else if (cursor.line >= startLine - 1 && cursor.line <= endLine - 1) {
      // Cursor was within deleted range, move to the line that took the place of the first deleted line
      const newCursorLine = Math.min(startLine - 1, newLines.length - 1);
      setCursorPosition(newCursorLine, 0);
      currentLineStore.set(newCursorLine);
    } else if (cursor.line > endLine - 1) {
      // Cursor was after deleted range, adjust its position
      const deletedCount = endLine - startLine + 1;
      const newCursorLine = Math.max(0, cursor.line - deletedCount);
      setCursorPosition(newCursorLine, Math.min(cursor.col, newLines[newCursorLine]?.length || 0));
      currentLineStore.set(newCursorLine);
    }
    
    return newLines;
  });
  await saveToLocalStorage();
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

export async function deleteCurrentLine() {
  textStore.update(lines => {
    if (lines.length === 0) return [];
    
    const cursor = getCursorPosition();
    const currentLineIndex = cursor.line;
    
    // Store the deleted line in register (including newline)
    const deletedLine = lines[currentLineIndex] || '';
    setRegister(deletedLine + '\n', 'line');
    
    // Remove the current line
    const newLines = [...lines];
    newLines.splice(currentLineIndex, 1);
    
    // Move cursor to the "next logical line"
    if (newLines.length === 0) {
      // No lines left, set cursor to 0,0
      setCursorPosition(0, 0);
      currentLineStore.set(0);
    } else if (currentLineIndex >= newLines.length) {
      // Deleted last line, move to previous line
      const newLineIndex = newLines.length - 1;
      setCursorPosition(newLineIndex, 0);
      currentLineStore.set(newLineIndex);
    } else {
      // Move to the line that took the place of the deleted line
      setCursorPosition(currentLineIndex, 0);
      currentLineStore.set(currentLineIndex);
    }
    
    return newLines;
  });
  await saveToLocalStorage();
}

export async function pasteLineAfterCurrent() {
  const register = getRegister();
  if (register.type !== 'line' || !register.content) return;
  
  textStore.update(lines => {
    const cursor = getCursorPosition();
    const currentLineIndex = cursor.line;
    
    // Remove the trailing newline from register content
    const contentToPaste = register.content.replace(/\n$/, '');
    
    // Insert the content after the current line
    const newLines = [...lines];
    newLines.splice(currentLineIndex + 1, 0, contentToPaste);
    
    // Move cursor to the pasted line
    setCursorPosition(currentLineIndex + 1, 0);
    currentLineStore.set(currentLineIndex + 1);
    
    return newLines;
  });
  await saveToLocalStorage();
}

// Save cursor position to PouchDB
export async function saveCursorPosition() {
  try {
    const cursor = getCursorPosition();
    const activeDoc = get(activeDocumentStore);
    
    if (activeDoc) {
      // Save cursor position to active document
      await documentService.saveDocument({
        ...activeDoc,
        cursorPosition: {
          line: cursor.line,
          col: cursor.col,
          want_col: cursor.want_col
        }
      });
    } else {
      // Fallback to global settings
      await settingsService.setSetting('cursorPosition', {
        line: cursor.line,
        col: cursor.col,
        want_col: cursor.want_col
      });
    }
  } catch (error) {
    console.error('Failed to save cursor position:', error);
  }
}

// Load cursor position from PouchDB
export async function loadCursorPosition() {
  try {
    const saved = await settingsService.getSetting('cursorPosition');
    
    if (saved && typeof saved === 'object' && 
        typeof saved.line === 'number' && 
        typeof saved.col === 'number') {
      return saved;
    }
  } catch (error) {
    console.error('Failed to load cursor position:', error);
  }
  return null;
}
