import { writable } from 'svelte/store';

export const fontSizeStore = writable(1); // in rem units

export function increaseFontSize() {
  fontSizeStore.update(size => Math.min(size + 0.1, 3)); // max 3rem
}

export function decreaseFontSize() {
  fontSizeStore.update(size => Math.max(size - 0.1, 0.5)); // min 0.5rem
}

export function resetFontSize() {
  fontSizeStore.set(1);
}
