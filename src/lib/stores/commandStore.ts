import { writable } from 'svelte/store';

export const commandStore = writable<string>('');

export function setCommand(command: string) {
  commandStore.set(command);
}

export function appendToCommand(char: string) {
  commandStore.update(command => command + char);
}

export function removeFromCommand() {
  commandStore.update(command => command.slice(0, -1));
}

export function clearCommand() {
  commandStore.set('');
}

export function getCommand(): string {
  let currentCommand: string = '';
  commandStore.subscribe(value => currentCommand = value)();
  return currentCommand;
}
