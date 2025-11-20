import { describe, it, expect, beforeEach } from 'vitest';
import { visualStore, startVisualSelection, updateVisualSelection, clearVisualSelection, getNormalizedSelection, type VisualState } from '$lib/stores/visualStore';

describe('Visual Store', () => {
  beforeEach(() => {
    clearVisualSelection();
  });

  it('should start visual selection with anchor position', () => {
    startVisualSelection('char', { line: 0, col: 5 });
    
    let state: VisualState | undefined;
    visualStore.subscribe((value: VisualState) => { state = value; })();
    
    expect(state!.active).toBe(true);
    expect(state!.type).toBe('char');
    expect(state!.anchor).toEqual({ line: 0, col: 5 });
    expect(state!.start).toEqual({ line: 0, col: 5 });
    expect(state!.end).toEqual({ line: 0, col: 5 });
  });

  it('should update visual selection end position', () => {
    startVisualSelection('char', { line: 0, col: 5 });
    updateVisualSelection({ line: 0, col: 10 });
    
    let state: VisualState | undefined;
    visualStore.subscribe((value: VisualState) => { state = value; })();
    
    expect(state!.active).toBe(true);
    expect(state!.anchor).toEqual({ line: 0, col: 5 });
    expect(state!.end).toEqual({ line: 0, col: 10 });
  });

  it('should normalize single line selection correctly', () => {
    startVisualSelection('char', { line: 2, col: 10 });
    updateVisualSelection({ line: 2, col: 5 });
    
    const normalized = getNormalizedSelection();
    
    expect(normalized).toEqual({
      start: { line: 2, col: 5 },
      end: { line: 2, col: 10 }
    });
  });

  it('should normalize multi-line selection correctly', () => {
    startVisualSelection('char', { line: 5, col: 10 });
    updateVisualSelection({ line: 3, col: 5 });
    
    const normalized = getNormalizedSelection();
    
    expect(normalized).toEqual({
      start: { line: 3, col: 5 },
      end: { line: 5, col: 10 }
    });
  });

  it('should clear visual selection', () => {
    startVisualSelection('char', { line: 0, col: 5 });
    clearVisualSelection();
    
    let state: VisualState | undefined;
    visualStore.subscribe((value: VisualState) => { state = value; })();
    
    expect(state!.active).toBe(false);
    expect(state!.type).toBe(null);
    expect(state!.anchor).toBe(null);
    expect(state!.start).toBe(null);
    expect(state!.end).toBe(null);
  });

  it('should return null for normalized selection when inactive', () => {
    const normalized = getNormalizedSelection();
    expect(normalized).toBe(null);
  });
});
