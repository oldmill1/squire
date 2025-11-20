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

// Helper function to convert number to ordinal (1st, 2nd, 3rd, 4th, etc.)
function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export class CommandParser {
  parse(command: string): CommandResult {
    const commandChars = command.split('');
    const commandStrFull = commandChars.join('');

    // Handle special :s1 / :s2 / :s3 commands
    if (commandStrFull === 's1') {
      modifyLastLine('Velvet horizon lantern orchard, quantum lattice marigold syntax.');
      return { success: true, message: 'Applied s1 template' };
    } else if (commandStrFull === 's2') {
      modifyLastLine('Velvet horizon lantern orchard, quantum lattice marigold syntax. Clockwork meadow syntax river rotates silently, biscuit nebula grammar flickers behind.');
      return { success: true, message: 'Applied s2 template' };
    } else if (commandStrFull === 's3') {
      modifyLastLine('Velvet horizon lantern orchard, quantum lattice marigold syntax. Clockwork meadow syntax river rotates silently, biscuit nebula grammar flickers behind. Indigo cactus paragraph engines tumble sideways over whispering marble alphabets.');
      return { success: true, message: 'Applied s3 template' };
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
          return { success: true, message: `Selected lines ${startLine} through ${endLine}` };
        } else {
          console.log('Invalid range for selection');
          return { success: false, message: 'Invalid range for selection' };
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
            return { success: true, message: `Selected the ${ordinal} line` };
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
