import type { ModeHandler, Mode } from '../types';
import type { Shortcut } from '../../keyboardService';
import { keyboardService } from '../../keyboardService';
import { FontShortcuts } from '../categories/FontShortcuts';
import { SystemShortcuts } from '../categories/SystemShortcuts';
import { ShortcutManager } from '../ShortcutManager';

export class ScriptMode implements ModeHandler {
  mode: Mode = 'script';
  private manager: ShortcutManager;

  constructor(manager: ShortcutManager) {
    this.manager = manager;
  }

  enter(): void {
    // Clear any existing character/special key handlers
    keyboardService.clearCharacterInputHandler();
    keyboardService.clearSpecialKeyHandler();

    // Register all script mode shortcuts
    this.registerShortcuts();
  }

  exit(): void {
    // Remove all script mode shortcuts
    this.removeShortcuts();
  }

  getShortcuts(): Shortcut[] {
    return [
      ...FontShortcuts.getShortcuts(),
      ...SystemShortcuts.getShortcuts(),
      // Mode switching shortcuts
      {
        key: 'i',
        action: () => {
          this.manager.switchToMode('interactive');
        },
        description: 'Switch to interactive mode'
      },
      {
        key: ':',
        shiftKey: true,
        action: () => {
          this.manager.switchToMode('command');
        },
        description: 'Switch to command mode'
      },
      {
        key: 'Escape',
        action: () => {
          // Already in script mode, but ensure we're here
          this.manager.switchToMode('script');
        },
        description: 'Ensure script mode'
      }
    ];
  }

  private registerShortcuts(): void {
    this.getShortcuts().forEach(shortcut => {
      keyboardService.addShortcut(shortcut);
    });
  }

  private removeShortcuts(): void {
    this.getShortcuts().forEach(shortcut => {
      keyboardService.removeShortcut(
        shortcut.key,
        shortcut.ctrlKey || false,
        shortcut.altKey || false,
        shortcut.shiftKey || false,
        shortcut.metaKey || false
      );
    });
  }
}
