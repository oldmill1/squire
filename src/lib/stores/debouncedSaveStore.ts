import { writable, get } from 'svelte/store';
import { activeDocumentStore } from './activeDocumentStore';
import { documentService } from '../services/documentService';
import { cursorStore } from './cursorStore';
import { showSaveNotification } from './saveNotificationStore';

// Debounced save state
let saveTimeout: number | null = null;
let pendingSave = false;

// Debounced save function
export function debouncedSave() {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  
  if (!pendingSave) {
    pendingSave = true;
    // Show "Saving..." in status bar
    const statusbar = document.querySelector('.statusbar-center');
    if (statusbar) {
      statusbar.textContent = 'Saving...';
    }
  }
  
  saveTimeout = setTimeout(async () => {
    await performSave();
    pendingSave = false;
  }, 500); // Wait 500ms after typing stops
}

async function performSave() {
  try {
    const activeDoc = get(activeDocumentStore);
    const cursor = get(cursorStore);
    
    if (!activeDoc) return;
    
    // Get current text from textStore
    let currentLines: string[] = [];
    const { textStore } = await import('./textStore');
    textStore.subscribe(value => currentLines = value)();
    
    // Save everything in one go
    await documentService.saveDocument({
      ...activeDoc,
      lines: currentLines,
      lineCount: currentLines.length,
      cursorPosition: {
        line: cursor.line,
        col: cursor.col,
        want_col: cursor.want_col
      }
    });
    
    // Update active document store
    activeDocumentStore.update(doc => doc ? { 
      ...doc, 
      lines: currentLines, 
      lineCount: currentLines.length,
      cursorPosition: {
        line: cursor.line,
        col: cursor.col,
        want_col: cursor.want_col
      }
    } : null);
    
    // Show saved notification
    showSaveNotification();
    
    // Update status bar
    const statusbar = document.querySelector('.statusbar-center');
    if (statusbar) {
      statusbar.textContent = 'Saved';
      setTimeout(() => {
        statusbar.textContent = activeDoc?.title || '';
      }, 1000);
    }
    
  } catch (error) {
    console.error('Failed to save document:', error);
    
    // Update status bar with error
    const statusbar = document.querySelector('.statusbar-center');
    if (statusbar) {
      statusbar.textContent = 'Save failed';
      setTimeout(async () => {
        const { get } = await import('svelte/store');
        const activeDoc = get(activeDocumentStore);
        statusbar.textContent = activeDoc?.title || '';
      }, 2000);
    }
  }
}
