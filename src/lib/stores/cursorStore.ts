import { writable } from 'svelte/store';

export interface CursorPosition {
  line: number;
  column: number;
}

export const cursorStore = writable<CursorPosition>({ line: 0, column: 0 });

export function setCursorLine(line: number) {
  cursorStore.update(position => ({ ...position, line }));
}

export function setCursorColumn(column: number) {
  cursorStore.update(position => ({ ...position, column }));
}

export function setCursorPosition(line: number, column: number) {
  cursorStore.set({ line, column });
}

export function getCursorPosition(): CursorPosition {
  let position: CursorPosition = { line: 0, column: 0 };
  cursorStore.subscribe(value => position = value)();
  return position;
}

export function moveCursorToEndOfLine(lineText: string) {
  cursorStore.update(position => ({ 
    ...position, 
    column: lineText.length 
  }));
}
