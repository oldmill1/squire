import { keyboardService } from './keyboardService';
import { increaseFontSize, decreaseFontSize, resetFontSize } from '$lib/stores/fontSizeStore';
import { setMode, modeStore, getMode } from '$lib/stores/modeStore';
import { appendText, insertNewline, deleteCharacter, deleteForward, getLines } from '$lib/stores/textStore';

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

  keyboardService.addShortcut({
    key: 'Escape',
    action: () => {
      console.log('Switched to script mode. Final text:', getLines());
      setMode('script');
      keyboardService.clearCharacterInputHandler();
      keyboardService.clearSpecialKeyHandler();
      // Re-add the "i" shortcut when returning to script mode
      addInteractiveShortcut();
    },
    description: 'Switch to script mode'
  });
}
