import { ShortcutManager } from './shortcuts/index';

// Global shortcut manager instance
let shortcutManager: ShortcutManager | null = null;

export function initializeShortcuts(): void {
  // Create the shortcut manager (auto-registers default modes)
  shortcutManager = new ShortcutManager();

  // Initialize the system (starts in normal mode)
  shortcutManager.initialize();
}

export function getShortcutManager(): ShortcutManager {
  if (!shortcutManager) {
    initializeShortcuts();
  }
  return shortcutManager!; // Non-null assertion - we know it's initialized now
}
