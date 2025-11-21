import type { CommandResult } from './types';
import { 
  getLines, 
  modifyLastLine, 
  deleteLine, 
  deleteAllLines, 
  deleteLinesRange
} from '$lib/stores/textStore';
import { 
  setSelectedLines,
  clearSelectedLines,
  getSelectedLines
} from '$lib/stores/selectedLinesStore';
import { 
  setCursorLine, 
  getCursorPosition 
} from '$lib/stores/cursorStore';
import { setCurrentLine } from '$lib/stores/currentLineStore';
import { showLineNumbers, hideLineNumbers } from '$lib/stores/lineNumberStore';
import { showDebugModule, hideDebugModule } from '$lib/stores/debugVisibilityStore';
import { settingsService } from '$lib/services/settingsService';

// Helper function to convert number to ordinal (1st, 2nd, 3rd, 4th, etc.)
function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export class CommandParser {
  parse(command: string): CommandResult {
    console.log('CommandParser.parse() received command:', `"${command}"`);
    
    // Remove leading colon if present (for commands like ":1", ":1,2", etc.)
    if (command.startsWith(':') && !command.startsWith(':set') && !command.startsWith(':dopen') && !command.startsWith(':dclose')) {
      command = command.substring(1);
      console.log('Removed leading colon, command now:', `"${command}"`);
    }
    
    const commandChars = command.split('');
    const commandStrFull = commandChars.join('');

    // Handle :set commands (with or without colon)
    if (commandStrFull.startsWith(':set ') || commandStrFull.startsWith('set ')) {
      const setting = commandStrFull.startsWith(':set ') 
        ? commandStrFull.substring(5).trim()
        : commandStrFull.substring(4).trim();
      
      if (setting === 'number') {
        showLineNumbers();
        // Save setting to PouchDB
        settingsService.setSetting('lineNumbers', true).catch(error => {
          console.error('Failed to save lineNumbers setting:', error);
        });
        return { success: true, message: 'Line numbers enabled' };
      } else if (setting === 'nonumber') {
        hideLineNumbers();
        // Save setting to PouchDB
        settingsService.setSetting('lineNumbers', false).catch(error => {
          console.error('Failed to save lineNumbers setting:', error);
        });
        return { success: true, message: 'Line numbers disabled' };
      } else {
        return { success: false, message: `Unknown setting: ${setting}` };
      }
    }

    // Handle debug module commands
    if (commandStrFull === ':dopen') {
      showDebugModule();
      return { success: true, message: 'Debug module opened' };
    } else if (commandStrFull === 'dopen') {
      showDebugModule();
      return { success: true, message: 'Debug module opened' };
    } else if (commandStrFull === ':dclose') {
      hideDebugModule();
      return { success: true, message: 'Debug module closed' };
    } else if (commandStrFull === 'dclose') {
      hideDebugModule();
      return { success: true, message: 'Debug module closed' };
    }

    
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
      return { success: true, message: `Selected all ${currentLines.length} lines` };
    } else if (commandChars.length >= 2 && commandChars[commandChars.length - 1] === 'd') {
      // Check for delete commands (e.g., "3d", "20d", "%d", "1,3d", "2,4d")
      const deleteChar = commandChars[commandChars.length - 1];
      const commandPart = commandChars.slice(0, -1).join('');

      if (commandPart === '%') {
        // Delete all lines
        deleteAllLines();
        console.log('Deleted all lines');
        return { success: true, message: 'Deleted all lines' };
      } else if (commandPart.includes(',')) {
        // Handle range delete (e.g., "1,3d", "2,4d")
        const [startStr, endStr] = commandPart.split(',');
        const startLine = parseInt(startStr);
        const endLine = parseInt(endStr);

        if (!isNaN(startLine) && !isNaN(endLine) && startLine > 0 && endLine > 0) {
          deleteLinesRange(startLine, endLine);
          console.log(`Deleted lines ${startLine} through ${endLine}`);
          return { success: true, message: `Deleted lines ${startLine} through ${endLine}` };
        } else {
          console.log('Invalid range for delete command');
          return { success: false, message: 'Invalid range for delete command' };
        }
      } else {
        // Delete specific line
        const lineNumber = parseInt(commandPart);
        if (!isNaN(lineNumber) && lineNumber > 0) {
          deleteLine(lineNumber);
          const ordinal = getOrdinal(lineNumber);
          console.log(`Deleted the ${ordinal} line`);
          return { success: true, message: `Deleted the ${ordinal} line` };
        } else {
          console.log('Invalid line number for delete command');
          return { success: false, message: 'Invalid line number for delete command' };
        }
      }
    } else {
      // Handle selection commands (including ranges)
      const commandStr = commandChars.join('');
      console.log('Processing selection command:', `"${commandStr}"`);

      if (commandStr.includes(',')) {
        console.log('Command contains comma - processing range selection');
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
          return { success: true, message: `Selected lines ${startLine} through ${endLine}` };
        } else {
          console.log('Invalid range for selection');
          return { success: false, message: 'Invalid range for selection' };
        }
      } else {
        console.log('Command does not contain comma - processing single line selection');
        // Look for numbers in the command (single line selection)
        let numberStr = '';
        for (const char of commandChars) {
          if (/\d/.test(char)) {
            numberStr += char;
          }
        }
        console.log('Extracted number string:', `"${numberStr}"`);

        if (numberStr.length > 0) {
          const lineNumber = parseInt(numberStr);
          console.log('Parsed line number:', lineNumber);

          if (!isNaN(lineNumber) && lineNumber > 0) {
            // Move cursor to the specified line (convert to 0-based index)
            const lineIndex = lineNumber - 1;
            console.log('Moving cursor to line index:', lineIndex);
            setCursorLine(lineIndex);
            setCurrentLine(lineIndex);
            // Convert number to ordinal (1st, 2nd, 3rd, etc.)
            const ordinal = getOrdinal(lineNumber);
            console.log(`Moved cursor to the ${ordinal} line`);
            return { success: true, message: `Moved cursor to the ${ordinal} line` };
          } else {
            console.log('Invalid line number');
            return { success: false, message: 'Invalid line number' };
          }
        }
      }
    }

    return { success: false, message: 'Unknown command' };
  }
}
