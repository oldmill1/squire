import { writable } from 'svelte/store';

export type VisualType = 'char';

export interface VisualPosition {
  line: number;
  col: number;
}

export interface VisualState {
  active: boolean;
  type: VisualType | null;
  anchor: VisualPosition | null;
  start: VisualPosition | null;
  end: VisualPosition | null;
}

export const visualStore = writable<VisualState>({
  active: false,
  type: null,
  anchor: null,
  start: null,
  end: null,
});

export function setVisualState(state: Partial<VisualState>) {
  visualStore.update(current => ({ ...current, ...state }));
}

export function getVisualState(): VisualState {
  let state: VisualState = {
    active: false,
    type: null,
    anchor: null,
    start: null,
    end: null,
  };
  visualStore.subscribe(value => state = value)();
  return state;
}

export function startVisualSelection(type: VisualType, anchor: VisualPosition) {
  visualStore.set({
    active: true,
    type,
    anchor,
    start: anchor,
    end: anchor,
  });
}

export function updateVisualSelection(end: VisualPosition) {
  visualStore.update(current => {
    if (!current.active || !current.anchor) return current;
    
    return {
      ...current,
      end,
    };
  });
}

export function clearVisualSelection() {
  visualStore.set({
    active: false,
    type: null,
    anchor: null,
    start: null,
    end: null,
  });
}

export function getNormalizedSelection(): { start: VisualPosition; end: VisualPosition } | null {
  let currentState: VisualState = {
    active: false,
    type: null,
    anchor: null,
    start: null,
    end: null,
  };
  
  const unsubscribe = visualStore.subscribe(value => {
    currentState = value;
  });
  unsubscribe();
  
  if (!currentState.active || !currentState.anchor || !currentState.end) {
    return null;
  }

  // Normalize start/end positions regardless of selection direction
  const start: VisualPosition = {
    line: Math.min(currentState.anchor.line, currentState.end.line),
    col: currentState.anchor.line === currentState.end.line 
      ? Math.min(currentState.anchor.col, currentState.end.col)
      : currentState.anchor.line < currentState.end.line ? currentState.anchor.col : currentState.end.col,
  };

  const end: VisualPosition = {
    line: Math.max(currentState.anchor.line, currentState.end.line),
    col: currentState.anchor.line === currentState.end.line 
      ? Math.max(currentState.anchor.col, currentState.end.col)
      : currentState.anchor.line > currentState.end.line ? currentState.anchor.col : currentState.end.col,
  };

  return { start, end };
}
