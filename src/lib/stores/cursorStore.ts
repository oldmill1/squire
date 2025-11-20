import { writable } from 'svelte/store';

export interface CursorPosition {
  line: number;
  col: number;       // current column index in the line
  want_col: number;  // preferred column when moving vertically
}

export const cursorStore = writable<CursorPosition>({ line: 0, col: 0, want_col: 0 });

export function setCursorLine(line: number) {
  cursorStore.update(position => ({ 
    ...position, 
    line,
    want_col: position.want_col // preserve want_col when changing lines
  }));
}

export function setCursorColumn(col: number) {
  cursorStore.update(position => ({ 
    ...position, 
    col,
    want_col: col // update want_col when explicitly setting column
  }));
}

export function setCursorPosition(line: number, col: number) {
  cursorStore.set({ line, col, want_col: col });
}

export function setCursorWantCol(want_col: number) {
  cursorStore.update(position => ({ 
    ...position, 
    want_col
  }));
}

export function getCursorPosition(): CursorPosition {
  let position: CursorPosition = { line: 0, col: 0, want_col: 0 };
  cursorStore.subscribe(value => position = value)();
  return position;
}

export function moveCursorToEndOfLine(lineText: string) {
  cursorStore.update(position => ({ 
    ...position, 
    col: lineText.length,
    want_col: lineText.length
  }));
}

// New function to sync cursor with line length (for vertical movement)
export function moveCursorToLineEnd(lineText: string, preserveWantCol: boolean = true) {
  cursorStore.update(position => {
    const targetCol = Math.min(position.want_col, lineText.length);
    return {
      ...position,
      col: targetCol,
      want_col: preserveWantCol ? position.want_col : targetCol
    };
  });
}
