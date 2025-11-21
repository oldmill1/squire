import { writable } from 'svelte/store';
import type { Document } from '$lib/types/document';

// Store for the currently active document
export const activeDocumentStore = writable<Document | null>(null);
