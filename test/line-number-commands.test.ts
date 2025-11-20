import { describe, it, expect, beforeEach } from 'vitest';
import { CommandParser } from '../src/lib/services/shortcuts/CommandParser';
import { lineNumberVisibilityStore } from '../src/lib/stores/lineNumberStore';
import { get } from 'svelte/store';

describe('CommandParser - Line Number Commands', () => {
  let parser: CommandParser;

  beforeEach(() => {
    parser = new CommandParser();
    // Reset line number visibility to default (true) before each test
    lineNumberVisibilityStore.set(true);
  });

  it('should enable line numbers when set number is executed', () => {
    const result = parser.parse('set number');
    
    expect(result.success).toBe(true);
    expect(result.message).toBe('Line numbers enabled');
    expect(get(lineNumberVisibilityStore)).toBe(true);
  });

  it('should enable line numbers when :set number is executed', () => {
    const result = parser.parse(':set number');
    
    expect(result.success).toBe(true);
    expect(result.message).toBe('Line numbers enabled');
    expect(get(lineNumberVisibilityStore)).toBe(true);
  });

  it('should disable line numbers when set nonumber is executed', () => {
    const result = parser.parse('set nonumber');
    
    expect(result.success).toBe(true);
    expect(result.message).toBe('Line numbers disabled');
    expect(get(lineNumberVisibilityStore)).toBe(false);
  });

  it('should disable line numbers when :set nonumber is executed', () => {
    const result = parser.parse(':set nonumber');
    
    expect(result.success).toBe(true);
    expect(result.message).toBe('Line numbers disabled');
    expect(get(lineNumberVisibilityStore)).toBe(false);
  });

  it('should handle unknown set commands', () => {
    const result = parser.parse('set unknown');
    
    expect(result.success).toBe(false);
    expect(result.message).toBe('Unknown setting: unknown');
    expect(get(lineNumberVisibilityStore)).toBe(true); // Should remain unchanged
  });

  it('should handle set commands with extra whitespace', () => {
    const result = parser.parse('set   nonumber   ');
    
    expect(result.success).toBe(true);
    expect(result.message).toBe('Line numbers disabled');
    expect(get(lineNumberVisibilityStore)).toBe(false);
  });

  it('should toggle line numbers correctly', () => {
    // Start with enabled (default)
    expect(get(lineNumberVisibilityStore)).toBe(true);
    
    // Disable
    parser.parse('set nonumber');
    expect(get(lineNumberVisibilityStore)).toBe(false);
    
    // Re-enable
    parser.parse('set number');
    expect(get(lineNumberVisibilityStore)).toBe(true);
  });
});
