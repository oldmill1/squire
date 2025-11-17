import { writable } from 'svelte/store';

export const textStore = writable<string>('');

export function appendText(char: string) {
  textStore.update(current => current + char);
}

export function getText(): string {
  let currentText: string = '';
  textStore.subscribe(value => currentText = value)();
  return currentText;
}
