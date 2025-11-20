import type { ModeHandler, Mode } from '../types';
import type { Shortcut } from '../../keyboardService';
import { keyboardService } from '../../keyboardService';
import { ShortcutManager } from '../ShortcutManager';
import { appendText, insertNewline, deleteCharacter, deleteForward } from '$lib/stores/textStore';
import { clearSelectedLines } from '$lib/stores/selectedLinesStore';

export class InteractiveMode implements ModeHandler {
  mode: Mode = 'interactive';
  private manager: ShortcutManager;

  constructor(manager: ShortcutManager) {
    this.manager = manager;
  }

  enter(): void {
    // Clear selection when entering interactive mode
    clearSelectedLines();

    // Set up character input handler for typing
    keyboardService.setCharacterInputHandler((char: string) => {
      appendText(char);
    });

    // Set up special key handler for editing
    keyboardService.setSpecialKeyHandler((key: string) => {
      if (key === 'Enter') {
        insertNewline();
      } else if (key === 'Backspace') {
        deleteCharacter();
      } else if (key === 'Delete') {
        deleteForward();
      } else if (key === 'Escape') {
        console.log('InteractiveMode: Escape pressed, switching to script mode');
        this.manager.switchToMode('script');
      }
    });

    // Don't register any shortcuts - all input goes through handlers
  }

  exit(): void {
    // Clear handlers
    keyboardService.clearCharacterInputHandler();
    keyboardService.clearSpecialKeyHandler();
  }

  getShortcuts(): Shortcut[] {
    // Interactive mode doesn't use shortcuts - all input is handled through character/special key handlers
    return [];
  }
}
