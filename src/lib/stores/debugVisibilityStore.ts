import { writable } from 'svelte/store';

export const debugVisibilityStore = writable<boolean>(false);

export function showDebugModule() {
	debugVisibilityStore.set(true);
}

export function hideDebugModule() {
	debugVisibilityStore.set(false);
}

export function toggleDebugModule() {
	debugVisibilityStore.update(current => !current);
}
