import type { Shortcut } from '../../keyboardService';
import { deleteAllLines } from '$lib/stores/textStore';

export class SystemShortcuts {
  static getShortcuts(): Shortcut[] {
    return [
      {
        key: 'dead',
        altKey: true,
        action: () => {
          deleteAllLines();
          console.log('Cleared all text with Option+N');
        },
        description: 'Clear all text'
      },
      {
        key: 'n',
        altKey: true,
        action: () => {
          deleteAllLines();
          console.log('New document created with Option+N');
        },
        description: 'Create new document'
      },
      {
        key: 'r',
        ctrlKey: true,
        action: () => {
          console.log('Ctrl+R pressed - custom refresh action');
          // Add your custom refresh logic here
        },
        description: 'Custom refresh'
      }
    ];
  }
}
