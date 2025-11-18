import { keyboardService } from './keyboardService';
import { increaseFontSize, decreaseFontSize, resetFontSize } from '$lib/stores/fontSizeStore';
import { setMode, modeStore, getMode } from '$lib/stores/modeStore';
import { appendText, insertNewline, deleteCharacter, deleteForward, getLines } from '$lib/stores/textStore';
import { appendToCommand, removeFromCommand, clearCommand, getCommand } from '$lib/stores/commandStore';
import { setSelectedLines, addSelectedLine, getSelectedLines, clearSelectedLines } from '$lib/stores/selectedLinesStore';
import { deleteLine, deleteAllLines, deleteLinesRange } from '$lib/stores/textStore';

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
          clearSelectedLines();
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
              // Clear selection before processing any selection command
              clearSelectedLines();
              
              // Check for wildcard % to select all lines
              if (commandChars.length === 1 && commandChars[0] === '%') {
                // Select all lines - get current line count from textStore
                const currentLines = getLines();
                const allLineNumbers = Array.from({ length: currentLines.length }, (_, i) => i + 1);
                setSelectedLines(allLineNumbers);
                console.log(`Selected all ${currentLines.length} lines:`, allLineNumbers);
                console.log('Store now contains:', getSelectedLines());
              } else if (commandChars.length >= 2 && commandChars[commandChars.length - 1] === 'd') {
                // Check for delete commands (e.g., "3d", "20d", "%d", "1,3d", "2,4d")
                const deleteChar = commandChars[commandChars.length - 1];
                const commandPart = commandChars.slice(0, -1).join('');
                
                if (commandPart === '%') {
                  // Delete all lines
                  deleteAllLines();
                  console.log('Deleted all lines');
                } else if (commandPart.includes(',')) {
                  // Handle range delete (e.g., "1,3d", "2,4d")
                  const [startStr, endStr] = commandPart.split(',');
                  const startLine = parseInt(startStr);
                  const endLine = parseInt(endStr);
                  
                  if (!isNaN(startLine) && !isNaN(endLine) && startLine > 0 && endLine > 0) {
                    deleteLinesRange(startLine, endLine);
                    console.log(`Deleted lines ${startLine} through ${endLine}`);
                  } else {
                    console.log('Invalid range for delete command');
                  }
                } else {
                  // Delete specific line
                  const lineNumber = parseInt(commandPart);
                  if (!isNaN(lineNumber) && lineNumber > 0) {
                    deleteLine(lineNumber);
                    const ordinal = getOrdinal(lineNumber);
                    console.log(`Deleted the ${ordinal} line`);
                  } else {
                    console.log('Invalid line number for delete command');
                  }
                }
              } else {
                // Handle selection commands (including ranges)
                const commandStr = commandChars.join('');
                
                if (commandStr.includes(',')) {
                  // Handle range selection (e.g., "1,3", "2,4")
                  const [startStr, endStr] = commandStr.split(',');
                  const startLine = parseInt(startStr);
                  const endLine = parseInt(endStr);
                  
                  if (!isNaN(startLine) && !isNaN(endLine) && startLine > 0 && endLine > 0) {
                    const range = Array.from({ length: endLine - startLine + 1 }, (_, i) => startLine + i);
                    const currentLines = getLines();
                    const validRange = range.filter(line => line <= currentLines.length);
                    
                    // Set the selection to the range (replace any existing selection)
                    setSelectedLines(validRange);
                    console.log(`Selected lines ${startLine} through ${endLine}:`, validRange);
                    console.log('Store now contains:', getSelectedLines());
                  } else {
                    console.log('Invalid range for selection');
                  }
                } else {
                  // Look for numbers in the command (single line selection)
                  let numberStr = '';
                  for (const char of commandChars) {
                    if (/\d/.test(char)) {
                      numberStr += char;
                    }
                  }
                  
                  if (numberStr.length > 0) {
                    const lineNumber = parseInt(numberStr);
                    
                    if (!isNaN(lineNumber) && lineNumber > 0) {
                      setSelectedLines([lineNumber]);
                      // Convert number to ordinal (1st, 2nd, 3rd, etc.)
                      const ordinal = getOrdinal(lineNumber);
                      console.log(`Selected the ${ordinal} line`);
                      console.log('Store now contains:', getSelectedLines());
                    } else {
                      console.log('Invalid line number');
                    }
                  }
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
          // Remove shortcuts while in command mode
          keyboardService.removeShortcut(':');
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
