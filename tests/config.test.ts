import { describe, it, expect } from 'vitest';
import {
  findAIToolByName,
  generateToolFileName,
  getToolDisplayName,
  DEFAULT_TARGET_FILE
} from '../src/config';

describe('AI Tool Configuration', () => {
  it('should be able to find existing tools', () => {
    // (Case-insensitive)
    expect(findAIToolByName('cursor')).toBeDefined();
    expect(findAIToolByName('CURSOR')).toBeDefined();
    expect(findAIToolByName('Cursor')).toBeDefined();

    expect(findAIToolByName('Claude Code')).toBeDefined();
    expect(findAIToolByName('claude code')).toBeDefined();
    expect(findAIToolByName('Claude-Code')).toBeDefined();
    expect(findAIToolByName('ClaudeCode')).toBeDefined();
    expect(findAIToolByName('claudeCode')).toBeDefined();
  });

  it('should return undefined when the tool does not exist', () => {
    expect(findAIToolByName('NonExistentTool')).toBeUndefined();
  });
});

describe('File Name Generation', () => {
  it('should generate correct file names for configurable tools', () => {
    const cursor = findAIToolByName('Cursor')!;
    const windsurf = findAIToolByName('Windsurf')!;
    const cline = findAIToolByName('Cline')!;
    const rooCode = findAIToolByName('Roo Code')!;

    // Test default target file name
    expect(generateToolFileName(cursor, DEFAULT_TARGET_FILE)).toBe('.cursor/rules/coding-standards.mdc');
    expect(generateToolFileName(windsurf, DEFAULT_TARGET_FILE)).toBe('.windsurf/rules/coding-standards.md');
    expect(generateToolFileName(cline, DEFAULT_TARGET_FILE)).toBe('.clinerules/coding-standards.md');
    expect(generateToolFileName(rooCode, DEFAULT_TARGET_FILE)).toBe('.roo/rules/coding-standards.md');

    // Test custom target file name
    expect(generateToolFileName(cursor, 'my-rules.md')).toBe('.cursor/rules/my-rules.mdc');
    expect(generateToolFileName(windsurf, 'my-rules.md')).toBe('.windsurf/rules/my-rules.md');
    expect(generateToolFileName(cline, 'my-rules.md')).toBe('.clinerules/my-rules.md');
    expect(generateToolFileName(rooCode, 'my-rules.md')).toBe('.roo/rules/my-rules.md');

    // Test Cursor's extension override
    expect(generateToolFileName(cursor, 'test.txt')).toBe('.cursor/rules/test.mdc');
  });

  it('should generate fixed file names for non-configurable tools', () => {
    const claude = findAIToolByName('Claude Code')!;
    const gemini = findAIToolByName('Gemini CLI')!;

    // Fixed tools ignore the target file name
    expect(generateToolFileName(claude, DEFAULT_TARGET_FILE)).toBe('CLAUDE.md');
    expect(generateToolFileName(claude, 'any-custom-name.md')).toBe('CLAUDE.md');

    expect(generateToolFileName(gemini, DEFAULT_TARGET_FILE)).toBe('GEMINI.md');
    expect(generateToolFileName(gemini, 'any-custom-name.md')).toBe('GEMINI.md');
  });

  it('should generate correct display names', () => {
    const cursor = findAIToolByName('Cursor')!;
    const claude = findAIToolByName('Claude Code')!;

    expect(getToolDisplayName(cursor, 'my-rules.md')).toBe('Cursor (.cursor/rules/my-rules.mdc)');
    expect(getToolDisplayName(claude, 'my-rules.md')).toBe('Claude Code (CLAUDE.md)');
  });

  it('should handle edge cases in file name generation', () => {
    const cursor = findAIToolByName('Cursor')!;
    const windsurf = findAIToolByName('Windsurf')!;

    // File name without extension
    expect(generateToolFileName(cursor, 'test')).toBe('.cursor/rules/test.mdc');
    expect(generateToolFileName(windsurf, 'test')).toBe('.windsurf/rules/test');

    // Multiple extensions
    expect(generateToolFileName(cursor, 'test.backup.md')).toBe('.cursor/rules/test.backup.mdc');
    expect(generateToolFileName(windsurf, 'test.backup.md')).toBe('.windsurf/rules/test.backup.md');
  });
});