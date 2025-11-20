import type { ModeHandler, Mode } from '../types';
import type { Shortcut } from '../../keyboardService';
import { keyboardService } from '../../keyboardService';
import { ShortcutManager } from '../ShortcutManager';
import { CommandParser } from '../CommandParser';
import { appendToCommand, removeFromCommand, clearCommand, getCommand } from '$lib/stores/commandStore';

export class CommandMode implements ModeHandler {
  mode: Mode = 'command';
  private manager: ShortcutManager;
  private commandParser: CommandParser;

  constructor(manager: ShortcutManager) {
    this.manager = manager;
    this.commandParser = new CommandParser();
  }

  enter(): void {
    console.log('Switched to command mode');

    // Set up character input handler for command typing
    keyboardService.setCharacterInputHandler((char: string) => {
      appendToCommand(char);
    });

    // Set up special key handler for command editing
    keyboardService.setSpecialKeyHandler((key: string) => {
      if (key === 'Escape') {
        // Exit command mode on Escape
        this.exitCommandMode();
      } else if (key === 'Backspace') {
        // Handle backspace in command mode
        removeFromCommand();
      } else if (key === 'Enter') {
        // Handle command execution on Enter
        this.executeCommand();
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
    // Command mode doesn't use shortcuts - all input is handled through character/special key handlers
    return [];
  }

  private exitCommandMode(): void {
    clearCommand();
    this.manager.switchToMode('script');
    console.log('Exited command mode');
  }

  private executeCommand(): void {
    const command = getCommand();
    console.log('Command characters:', command.split(''));
    
    const result = this.commandParser.parse(command);
    
    if (result.message) {
      console.log(result.message);
    }

    clearCommand();
    this.manager.switchToMode('script');
  }
}
