import { writable } from 'svelte/store';
import { showSaveNotification } from './saveNotificationStore';

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
      return newLines;
    }
  });
  saveToLocalStorage();
}

export function insertNewline() {
  textStore.update(lines => {
    if (lines.length === 0) {
      // No lines exist, create an empty line
      return [''];
    } else {
      // Add a new empty line
      return [...lines, ''];
    }
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
    } else if (newLines.length > 1) {
      // Remove the empty line
      newLines.pop();
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
