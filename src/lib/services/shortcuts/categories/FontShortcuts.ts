import type { Shortcut } from '../../keyboardService';
import { increaseFontSize, decreaseFontSize } from '$lib/stores/fontSizeStore';

export class FontShortcuts {
  static getShortcuts(): Shortcut[] {
    return [
      {
        key: '+',
        action: increaseFontSize,
        description: 'Increase font size'
      },
      {
        key: '=',
        action: increaseFontSize,
        description: 'Increase font size'
      },
      {
        key: '-',
        action: decreaseFontSize,
        description: 'Decrease font size'
      },
      {
        key: '_',
        action: decreaseFontSize,
        description: 'Decrease font size'
      }
    ];
  }
}
