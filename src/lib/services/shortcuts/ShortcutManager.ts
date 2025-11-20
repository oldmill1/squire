import { keyboardService } from '../keyboardService';
import type { Mode, ModeHandler } from './types';
import { setMode } from '$lib/stores/modeStore';
import { NormalMode } from './modes/NormalMode';
import { CommandMode } from './modes/CommandMode';
import { InsertMode } from './modes/InsertMode';

export class ShortcutManager {
  private modes: Map<Mode, ModeHandler> = new Map();
  private currentMode: Mode = 'normal';

  constructor() {
    // Auto-register default modes
    this.registerMode(new NormalMode(this));
    this.registerMode(new CommandMode(this));
    this.registerMode(new InsertMode(this));
    
    // Don't get initial mode from store - force normal mode on initialization
    this.currentMode = 'normal';
  }

  registerMode(modeHandler: ModeHandler): void {
    this.modes.set(modeHandler.mode, modeHandler);
  }

  switchToMode(mode: Mode): void {
    // Exit current mode (if different)
    if (this.currentMode !== mode) {
      const currentHandler = this.modes.get(this.currentMode);
      if (currentHandler) {
        currentHandler.exit();
      }
    }

    // Always enter the new mode to ensure shortcuts are registered
    const newHandler = this.modes.get(mode);
    if (newHandler) {
      newHandler.enter();
      this.currentMode = mode;
      setMode(mode);
    }
  }

  getCurrentMode(): Mode {
    return this.currentMode;
  }

  initialize(): void {
    // Start with normal mode
    this.switchToMode('normal');
  }

  getModeHandler(mode: Mode): ModeHandler | undefined {
    return this.modes.get(mode);
  }

  getAllModeHandlers(): ModeHandler[] {
    return Array.from(this.modes.values());
  }
}
