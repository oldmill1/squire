import { writable } from 'svelte/store';

export const lineNumberVisibilityStore = writable(false); // Default to hidden

export function showLineNumbers(): void {
  lineNumberVisibilityStore.set(true);
}

export function hideLineNumbers(): void {
  lineNumberVisibilityStore.set(false);
}

export function getLineNumberVisibility(): boolean {
  let visibility = false;
  lineNumberVisibilityStore.subscribe(value => visibility = value)();
  return visibility;
}
