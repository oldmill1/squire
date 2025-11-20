import { writable } from 'svelte/store';

export type Mode = 'insert' | 'normal' | 'command' | 'visual_char';

export const modeStore = writable<Mode>('normal');

export function setMode(mode: Mode) {
  modeStore.set(mode);
}

export function getMode(): Mode {
  let currentMode: Mode = 'normal';
  modeStore.subscribe(value => currentMode = value)();
  return currentMode;
}
