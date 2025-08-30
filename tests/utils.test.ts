import { describe, it, expect } from 'vitest';
import { validateFilePath, parseCustomPaths } from '../src/utils';

describe('Utility function tests', () => {
  describe('File path validation', () => {
    it('should accept common valid paths', () => {
      const validPaths = [
        'rule.md',
        'docs/rule.md',
        './rule.md',
        '../rule.md',
        'my-project-rules.md',
        '.custom/coding-standards.md'
      ];

      validPaths.forEach(path => {
        expect(validateFilePath(path).valid).toBe(true);
      });
    });

    it('should reject obviously invalid paths', () => {
      const invalidPaths = [
        '',
        '   ',
        'file<.md',
        'file>.md',
        'file|.md',
        'file?.md',
        'file*.md'
      ];

      invalidPaths.forEach(path => {
        expect(validateFilePath(path).valid).toBe(false);
      });
    });
  });

  describe('Custom path parsing', () => {
    it('should correctly parse comma-separated paths', () => {
      expect(parseCustomPaths('file1.md,file2.md')).toEqual(['file1.md', 'file2.md']);
      expect(parseCustomPaths(' file1.md , file2.md ')).toEqual(['file1.md', 'file2.md']);
      expect(parseCustomPaths('file1.md')).toEqual(['file1.md']);
      expect(parseCustomPaths('')).toEqual([]);
    });
  });
});