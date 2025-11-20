import { writable } from 'svelte/store';

export const lineNumberVisibilityStore = writable(true);

export function showLineNumbers(): void {
  lineNumberVisibilityStore.set(true);
}

export function hideLineNumbers(): void {
  lineNumberVisibilityStore.set(false);
}

export function getLineNumberVisibility(): boolean {
  let visibility = true;
  lineNumberVisibilityStore.subscribe(value => visibility = value)();
  return visibility;
}
