import { writable } from 'svelte/store';

export const textStore = writable<string>('');

export function appendText(char: string) {
  textStore.update(current => current + char);
}

export function insertNewline() {
  textStore.update(current => current + '\n');
}

export function deleteCharacter() {
  textStore.update(current => current.slice(0, -1));
}

export function deleteForward() {
  // For now, this behaves the same as backspace
  // In a more complex implementation, this would consider cursor position
  deleteCharacter();
}

export function getText(): string {
  let currentText: string = '';
  textStore.subscribe(value => currentText = value)();
  return currentText;
}
