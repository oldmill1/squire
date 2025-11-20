import { writable } from 'svelte/store';

export interface Register {
  content: string;
  type: 'line' | 'character';
}

export const registerStore = writable<Register>({ content: '', type: 'character' });

export function setRegister(content: string, type: 'line' | 'character' = 'character') {
  registerStore.set({ content, type });
}

export function getRegister(): Register {
  let register: Register = { content: '', type: 'character' };
  registerStore.subscribe(value => register = value)();
  return register;
}
