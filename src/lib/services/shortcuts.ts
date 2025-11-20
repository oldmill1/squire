import { 
  ShortcutManager, 
  ScriptMode, 
  CommandMode, 
  InteractiveMode 
} from './shortcuts/index';

// Global shortcut manager instance
let shortcutManager: ShortcutManager | null = null;

export function initializeShortcuts(): void {
  // Create the shortcut manager
  shortcutManager = new ShortcutManager();

  // Register all modes
  const scriptMode = new ScriptMode(shortcutManager);
  const commandMode = new CommandMode(shortcutManager);
  const interactiveMode = new InteractiveMode(shortcutManager);
  
  shortcutManager.registerMode(scriptMode);
  shortcutManager.registerMode(commandMode);
  shortcutManager.registerMode(interactiveMode);

  // Initialize the system (starts in script mode)
  shortcutManager.initialize();
}

export function getShortcutManager(): ShortcutManager | null {
  return shortcutManager;
}
