import { writable } from 'svelte/store';

export type ShortcutAction = () => void | Promise<void>;

export interface Shortcut {
  key: string;
  action: ShortcutAction;
  description?: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
}

export interface CharacterInputHandler {
  (char: string): void;
}

export interface SpecialKeyHandler {
  (key: string): void;
}

interface KeyboardServiceState {
  shortcuts: Map<string, Shortcut>;
  isEnabled: boolean;
  characterInputHandler?: CharacterInputHandler;
  specialKeyHandler?: SpecialKeyHandler;
}

class KeyboardService {
  private store = writable<KeyboardServiceState>({
    shortcuts: new Map(),
    isEnabled: true
  });

  private keydownHandler = (event: KeyboardEvent) => {
    const { shortcuts, isEnabled, characterInputHandler, specialKeyHandler } = this.getStoreValue();
    
    if (!isEnabled) return;

    const key = this.createKey(event);
    const shortcut = shortcuts.get(key);
    
    if (shortcut) {
      event.preventDefault();
      event.stopPropagation();
      shortcut.action();
    } else if (specialKeyHandler && this.isSpecialKey(event)) {
      // Debug Escape key handling
      if (event.key === 'Escape') {
        console.log('KeyboardService: handling Escape key - specialKeyHandler exists:', !!specialKeyHandler);
      }
      event.preventDefault();
      event.stopPropagation();
      specialKeyHandler(event.key);
    } else if (characterInputHandler && this.isPrintableCharacter(event)) {
      event.preventDefault();
      event.stopPropagation();
      characterInputHandler(event.key);
    }
  };

  private createKey(event: KeyboardEvent): string {
    const parts = [];
    if (event.ctrlKey) parts.push('ctrl');
    if (event.altKey) parts.push('alt');
    if (event.shiftKey) parts.push('shift');
    if (event.metaKey) parts.push('meta');
    parts.push(event.key.toLowerCase());
    return parts.join('+');
  }

  private isPrintableCharacter(event: KeyboardEvent): boolean {
    // Check if the key is a printable character (not a control key)
    return event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey;
  }

  private isSpecialKey(event: KeyboardEvent): boolean {
    // Check if the key is a special editing key (Enter, Delete, Backspace, Escape)
    const specialKeys = ['Enter', 'Delete', 'Backspace', 'Escape'];
    return specialKeys.includes(event.key) && !event.ctrlKey && !event.altKey && !event.metaKey;
  }

  private getStoreValue(): KeyboardServiceState {
    let value: KeyboardServiceState | undefined;
    this.store.subscribe(v => value = v)();
    return value!;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.keydownHandler);
    }
  }

  subscribe = this.store.subscribe;

  addShortcut(shortcut: Shortcut): void {
    const { shortcuts } = this.getStoreValue();
    const key = this.createShortcutKey(shortcut);
    shortcuts.set(key, shortcut);
    this.store.update(state => ({ ...state, shortcuts: new Map(shortcuts) }));
  }

  removeShortcut(key: string, ctrlKey = false, altKey = false, shiftKey = false, metaKey = false): void {
    const { shortcuts } = this.getStoreValue();
    const parts = [];
    if (ctrlKey) parts.push('ctrl');
    if (altKey) parts.push('alt');
    if (shiftKey) parts.push('shift');
    if (metaKey) parts.push('meta');
    parts.push(key.toLowerCase());
    const fullKey = parts.join('+');
    
    shortcuts.delete(fullKey);
    this.store.update(state => ({ ...state, shortcuts: new Map(shortcuts) }));
  }

  enable(): void {
    this.store.update(state => ({ ...state, isEnabled: true }));
  }

  disable(): void {
    this.store.update(state => ({ ...state, isEnabled: false }));
  }

  getShortcuts(): Shortcut[] {
    const { shortcuts } = this.getStoreValue();
    return Array.from(shortcuts.values());
  }

  setCharacterInputHandler(handler?: CharacterInputHandler): void {
    this.store.update(state => ({ ...state, characterInputHandler: handler }));
  }

  setSpecialKeyHandler(handler?: SpecialKeyHandler): void {
    this.store.update(state => ({ ...state, specialKeyHandler: handler }));
  }

  clearCharacterInputHandler(): void {
    this.store.update(state => ({ ...state, characterInputHandler: undefined }));
  }

  clearSpecialKeyHandler(): void {
    this.store.update(state => ({ ...state, specialKeyHandler: undefined }));
  }

  private createShortcutKey(shortcut: Shortcut): string {
    const parts = [];
    if (shortcut.ctrlKey) parts.push('ctrl');
    if (shortcut.altKey) parts.push('alt');
    if (shortcut.shiftKey) parts.push('shift');
    if (shortcut.metaKey) parts.push('meta');
    parts.push(shortcut.key.toLowerCase());
    return parts.join('+');
  }

  destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('keydown', this.keydownHandler);
    }
  }
}

export const keyboardService = new KeyboardService();

