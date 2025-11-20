import { writable } from 'svelte/store';

export type Mode = 'insert' | 'script' | 'command';

export const modeStore = writable<Mode>('script');

export function setMode(mode: Mode) {
  modeStore.set(mode);
}

export function getMode(): Mode {
  let currentMode: Mode = 'script';
  modeStore.subscribe(value => currentMode = value)();
  return currentMode;
}
