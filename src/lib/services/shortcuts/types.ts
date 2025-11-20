import type { Shortcut, CharacterInputHandler, SpecialKeyHandler } from '../keyboardService';

export type Mode = 'normal' | 'command' | 'insert' | 'visual_char';

export interface ModeHandler {
  mode: Mode;
  enter(): void;
  exit(): void;
  getShortcuts(): Shortcut[];
}

export interface CommandResult {
  success: boolean;
  message?: string;
}

export interface ShortcutCategory {
  name: string;
  getShortcuts(): Shortcut[];
}

export interface CommandParser {
  parse(command: string): CommandResult;
}
