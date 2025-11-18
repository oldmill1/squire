import { keyboardService } from './keyboardService';
import { increaseFontSize, decreaseFontSize, resetFontSize } from '$lib/stores/fontSizeStore';
import { setMode, modeStore, getMode } from '$lib/stores/modeStore';
import { appendText, insertNewline, deleteCharacter, deleteForward } from '$lib/stores/textStore';

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
        console.log('i key pressed, current mode:', currentMode);
        if (currentMode !== 'interactive') {
          console.log('Switching to interactive mode');
          setMode('interactive');
          keyboardService.setCharacterInputHandler((char: string) => {
            console.log('Character input handler called with:', char);
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
          console.log('Switched to interactive mode, removed i shortcut');
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
      setMode('script');
      keyboardService.clearCharacterInputHandler();
      keyboardService.clearSpecialKeyHandler();
      // Re-add the "i" shortcut when returning to script mode
      addInteractiveShortcut();
      console.log('Switched to script mode, re-added i shortcut');
    },
    description: 'Switch to script mode'
  });
}
