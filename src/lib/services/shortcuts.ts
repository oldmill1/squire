import { keyboardService } from './keyboardService';
import { increaseFontSize, decreaseFontSize, resetFontSize } from '$lib/stores/fontSizeStore';
import { setMode, modeStore, getMode } from '$lib/stores/modeStore';
import { appendText, insertNewline, deleteCharacter, deleteForward, getLines } from '$lib/stores/textStore';
import { appendToCommand, removeFromCommand, clearCommand, getCommand } from '$lib/stores/commandStore';
import { addSelectedLine, getSelectedLines } from '$lib/stores/selectedLinesStore';

// Helper function to convert number to ordinal (1st, 2nd, 3rd, 4th, etc.)
function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function initializeShortcuts() {
  // Font size shortcuts
  keyboardService.addShortcut({
    key: '+',
    action: increaseFontSize,
    description: 'Increase font size'
  });

  keyboardService.addShortcut({
    key: '=',
    action: increaseFontSize,
    description: 'Increase font size'
  });

  keyboardService.addShortcut({
    key: '-',
    action: decreaseFontSize,
    description: 'Decrease font size'
  });

  keyboardService.addShortcut({
    key: '_',
    action: decreaseFontSize,
    description: 'Decrease font size'
  });

  keyboardService.addShortcut({
    key: '0',
    action: resetFontSize,
    description: 'Reset font size'
  });

  // Example of more complex shortcuts
  keyboardService.addShortcut({
    key: 'r',
    ctrlKey: true,
    action: () => {
      console.log('Ctrl+R pressed - custom refresh action');
      // Add your custom refresh logic here
    },
    description: 'Custom refresh'
  });

  // Mode switching shortcuts
  const addInteractiveShortcut = () => {
    keyboardService.addShortcut({
      key: 'i',
      action: () => {
        const currentMode = getMode();
        if (currentMode !== 'interactive') {
          setMode('interactive');
          console.log('Switched to interactive mode. Current text:', getLines());
          keyboardService.setCharacterInputHandler((char: string) => {
            appendText(char);
          });
          keyboardService.setSpecialKeyHandler((key: string) => {
            if (key === 'Enter') {
              insertNewline();
            } else if (key === 'Backspace') {
              deleteCharacter();
            } else if (key === 'Delete') {
              deleteForward();
            }
          });
          // Remove the "i" shortcut while in interactive mode
          keyboardService.removeShortcut('i');
        }
      },
      description: 'Switch to interactive mode'
    });
  };

  // Add the initial "i" shortcut
  addInteractiveShortcut();

  // Helper function to add command shortcut
  const addCommandShortcut = () => {
    keyboardService.addShortcut({
      key: ':',
      shiftKey: true,
      action: () => {
        const currentMode = getMode();
        if (currentMode === 'script') {
          setMode('command');
          console.log('Switched to command mode');
          // Set up command mode handlers
          keyboardService.setCharacterInputHandler((char: string) => {
            // Append character to command
            appendToCommand(char);
          });
          keyboardService.setSpecialKeyHandler((key: string) => {
            if (key === 'Escape') {
              // Exit command mode on Escape
              setMode('script');
              keyboardService.clearCharacterInputHandler();
              keyboardService.clearSpecialKeyHandler();
              clearCommand();
              // Re-add shortcuts when returning to script mode
              addInteractiveShortcut();
              addCommandShortcut();
              console.log('Exited command mode');
            } else if (key === 'Backspace') {
              // Handle backspace in command mode
              removeFromCommand();
            } else if (key === 'Enter') {
              // Handle command execution on Enter
              const command = getCommand();
              // Convert command string to array of characters
              const commandChars = command.split('');
              
              // Process command for line selection
              if (commandChars.includes('%')) {
                const percentIndex = commandChars.indexOf('%');
                // Check if there's a character after %
                if (percentIndex + 1 < commandChars.length) {
                  const lineNumberChar = commandChars[percentIndex + 1];
                  const lineNumber = parseInt(lineNumberChar);
                  
                  if (!isNaN(lineNumber) && lineNumber > 0) {
                    addSelectedLine(lineNumber);
                    // Convert number to ordinal (1st, 2nd, 3rd, etc.)
                    const ordinal = getOrdinal(lineNumber);
                    console.log(`Selected the ${ordinal} line`);
                  } else {
                    console.log('Invalid line number after %');
                  }
                } else {
                  console.log('No line number specified after %');
                }
              }
              
              console.log('Command characters:', commandChars);
              clearCommand();
              setMode('script');
              keyboardService.clearCharacterInputHandler();
              keyboardService.clearSpecialKeyHandler();
              // Re-add shortcuts when returning to script mode
              addInteractiveShortcut();
              addCommandShortcut();
            }
          });
          // Remove the colon shortcut while in command mode
          keyboardService.removeShortcut(':', true);
        }
      },
      description: 'Switch to command mode'
    });
  };

  // Add the initial command shortcut
  addCommandShortcut();

  keyboardService.addShortcut({
    key: 'Escape',
    action: () => {
      console.log('Switched to script mode. Final text:', getLines());
      setMode('script');
      keyboardService.clearCharacterInputHandler();
      keyboardService.clearSpecialKeyHandler();
      // Re-add the "i" shortcut when returning to script mode
      addInteractiveShortcut();
      // Re-add the colon shortcut when returning to script mode
      addCommandShortcut();
    },
    description: 'Switch to script mode'
  });
}
