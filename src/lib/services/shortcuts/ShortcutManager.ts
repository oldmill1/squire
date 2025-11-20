import { keyboardService } from '../keyboardService';
import type { Mode, ModeHandler } from './types';
import { setMode, getMode } from '$lib/stores/modeStore';

export class ShortcutManager {
  private modes: Map<Mode, ModeHandler> = new Map();
  private currentMode: Mode = 'script';

  constructor() {
    // Don't get initial mode from store - force script mode on initialization
    this.currentMode = 'script';
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
    // Start with script mode
    this.switchToMode('script');
  }

  getModeHandler(mode: Mode): ModeHandler | undefined {
    return this.modes.get(mode);
  }

  getAllModeHandlers(): ModeHandler[] {
    return Array.from(this.modes.values());
  }
}
