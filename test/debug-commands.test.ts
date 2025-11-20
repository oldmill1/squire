import { describe, it, expect, beforeEach } from 'vitest';
import { CommandParser } from '../src/lib/services/shortcuts/CommandParser';
import { get } from 'svelte/store';
import { debugVisibilityStore } from '../src/lib/stores/debugVisibilityStore';

describe('Debug Commands', () => {
  let commandParser: CommandParser;

  beforeEach(() => {
    commandParser = new CommandParser();
    // Reset debug visibility to false before each test
    debugVisibilityStore.set(false);
  });

  it('should show debug module with :dopen command', () => {
    const result = commandParser.parse(':dopen');
    
    expect(result.success).toBe(true);
    expect(result.message).toBe('Debug module opened');
    expect(get(debugVisibilityStore)).toBe(true);
  });

  it('should show debug module with dopen command (without colon)', () => {
    const result = commandParser.parse('dopen');
    
    expect(result.success).toBe(true);
    expect(result.message).toBe('Debug module opened');
    expect(get(debugVisibilityStore)).toBe(true);
  });

  it('should hide debug module with :dclose command', () => {
    // First show the debug module
    debugVisibilityStore.set(true);
    
    const result = commandParser.parse(':dclose');
    
    expect(result.success).toBe(true);
    expect(result.message).toBe('Debug module closed');
    expect(get(debugVisibilityStore)).toBe(false);
  });

  it('should hide debug module with dclose command (without colon)', () => {
    // First show the debug module
    debugVisibilityStore.set(true);
    
    const result = commandParser.parse('dclose');
    
    expect(result.success).toBe(true);
    expect(result.message).toBe('Debug module closed');
    expect(get(debugVisibilityStore)).toBe(false);
  });
});
