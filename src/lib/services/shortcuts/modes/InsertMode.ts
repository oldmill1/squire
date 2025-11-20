import type { ModeHandler, Mode } from '../types';
import type { Shortcut } from '../../keyboardService';
import { keyboardService } from '../../keyboardService';
import { ShortcutManager } from '../ShortcutManager';
import { appendText, insertNewline, deleteCharacter, deleteForward, getLines } from '$lib/stores/textStore';
import { clearSelectedLines } from '$lib/stores/selectedLinesStore';
import { getCursorPosition, moveCursorToEndOfLine } from '$lib/stores/cursorStore';

export class InsertMode implements ModeHandler {
  mode: Mode = 'insert';
  private manager: ShortcutManager;

  constructor(manager: ShortcutManager) {
    this.manager = manager;
  }

  enter(): void {
    // Clear selection when entering insert mode
    clearSelectedLines();

    // Don't automatically move cursor - preserve position from visual/normal mode
    // This allows proper cursor positioning when coming from visual mode

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
        this.manager.switchToMode('normal');
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
