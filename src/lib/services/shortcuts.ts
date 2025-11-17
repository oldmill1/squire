import { keyboardService } from './keyboardService';
import { increaseFontSize, decreaseFontSize, resetFontSize } from '$lib/stores/fontSizeStore';
import { setMode, modeStore } from '$lib/stores/modeStore';
import { appendText } from '$lib/stores/textStore';

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
  keyboardService.addShortcut({
    key: 'i',
    action: () => {
      setMode('interactive');
      keyboardService.setCharacterInputHandler((char: string) => {
        appendText(char);
      });
      console.log('Switched to interactive mode');
    },
    description: 'Switch to interactive mode'
  });

  keyboardService.addShortcut({
    key: 'Escape',
    action: () => {
      setMode('script');
      keyboardService.clearCharacterInputHandler();
      console.log('Switched to script mode');
    },
    description: 'Switch to script mode'
  });
}
