import { writable } from 'svelte/store';

const STORAGE_KEY = 'squire-transform';

export const transformStore = writable<number>(0);

// Save to localStorage
export function saveTransformToLocalStorage() {
  if (typeof window === 'undefined') return; // Skip during SSR
  
  let currentTransform: number = 0;
  transformStore.subscribe(value => currentTransform = value)();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(currentTransform));
}

// Load from localStorage
export function loadTransformFromLocalStorage(): number {
  if (typeof window === 'undefined') return 0; // Skip during SSR
  
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const transform = JSON.parse(saved);
      if (typeof transform === 'number') {
        transformStore.set(transform);
        return transform;
      }
    } catch (e) {
      console.error('Failed to parse saved transform:', e);
    }
  }
  return 0;
}

// Update transform value
export function updateTransform(value: number) {
  transformStore.set(value);
  saveTransformToLocalStorage();
}

// Reset transform
export function resetTransform() {
  transformStore.set(0);
  saveTransformToLocalStorage();
}
