import { writable } from 'svelte/store';

export const currentLineStore = writable<number>(0);

export function setCurrentLine(lineNumber: number) {
  currentLineStore.set(lineNumber);
}

export function getCurrentLine(): number {
  let currentLine: number = 0;
  currentLineStore.subscribe(value => currentLine = value)();
  return currentLine;
}
