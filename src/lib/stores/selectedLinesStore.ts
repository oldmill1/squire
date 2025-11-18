import { writable } from 'svelte/store';

export const selectedLinesStore = writable<number[]>([]);

export function setSelectedLines(lines: number[]) {
  selectedLinesStore.set(lines);
}

export function addSelectedLine(lineNumber: number) {
  selectedLinesStore.update(lines => {
    if (!lines.includes(lineNumber)) {
      return [...lines, lineNumber].sort((a, b) => a - b);
    }
    return lines;
  });
}

export function removeSelectedLine(lineNumber: number) {
  selectedLinesStore.update(lines => 
    lines.filter(line => line !== lineNumber)
  );
}

export function toggleSelectedLine(lineNumber: number) {
  selectedLinesStore.update(lines => {
    if (lines.includes(lineNumber)) {
      return lines.filter(line => line !== lineNumber);
    } else {
      return [...lines, lineNumber].sort((a, b) => a - b);
    }
  });
}

export function clearSelectedLines() {
  selectedLinesStore.set([]);
}

export function getSelectedLines(): number[] {
  let currentLines: number[] = [];
  selectedLinesStore.subscribe(value => currentLines = value)();
  return currentLines;
}

export function isLineSelected(lineNumber: number): boolean {
  const lines = getSelectedLines();
  const isSelected = lines.includes(lineNumber);
  console.log(`isLineSelected(${lineNumber}):`, isSelected, 'store contains:', lines);
  return isSelected;
}
