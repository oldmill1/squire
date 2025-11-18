import { writable } from 'svelte/store';

export type Mode = 'interactive' | 'script';

export const modeStore = writable<Mode>('interactive');

export function setMode(mode: Mode) {
  modeStore.set(mode);
}

export function getMode(): Mode {
  let currentMode: Mode = 'interactive';
  modeStore.subscribe(value => currentMode = value)();
  return currentMode;
}
