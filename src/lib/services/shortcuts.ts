import { ShortcutManager } from './shortcuts/index';

// Global shortcut manager instance
let shortcutManager: ShortcutManager | null = null;

export function initializeShortcuts(): void {
  // Create the shortcut manager (auto-registers default modes)
  shortcutManager = new ShortcutManager();

  // Initialize the system (starts in script mode)
  shortcutManager.initialize();
}

export function getShortcutManager(): ShortcutManager | null {
  return shortcutManager;
}
