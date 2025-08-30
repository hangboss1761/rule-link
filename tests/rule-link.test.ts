import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import { join, relative } from 'path';
import { tmpdir } from 'os';
import { handleCreateCommand } from '../src/cli';
import * as interactive from '../src/interactive';

// Mock console.log to avoid output during tests
vi.spyOn(console, 'log').mockImplementation(() => {});

// Test directory management
let testDir: string;
const originalCwd = process.cwd();

beforeEach(async () => {
  testDir = join(tmpdir(), `rule-link-test-${Date.now()}`);
  await fs.mkdir(testDir, { recursive: true });
  process.chdir(testDir);
});

afterEach(async () => {
  process.chdir(originalCwd);
  try {
    await fs.rm(testDir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
  vi.restoreAllMocks();
});

describe('rule-link user scenario tests (non-interactive mode)', () => {
  describe('Basic usage scenarios', () => {
    it('user specifies a single AI tool to create a symlink', async () => {
      await handleCreateCommand({
        file: 'rule.md',
        list: ['Cursor']
      });

      const ruleContent = await fs.readFile('rule.md', 'utf8');
      expect(ruleContent).toBe('');

      const cursorStats = await fs.lstat('.cursor/rules/coding-standards.mdc');
      expect(cursorStats.isSymbolicLink()).toBe(true);

      await fs.writeFile('rule.md', '# My Rules');
      const linkedContent = await fs.readFile('.cursor/rules/coding-standards.mdc', 'utf8');
      expect(linkedContent).toBe('# My Rules');
    });

    it('user specifies multiple AI tools to create symlinks', async () => {
      await handleCreateCommand({
        file: 'rule.md',
        list: ['Cursor', 'Windsurf', 'Claude Code']
      });

      const targets = ['.cursor/rules/coding-standards.mdc', '.windsurf/rules/coding-standards.md', 'CLAUDE.md'];
      for (const target of targets) {
        const stats = await fs.lstat(target);
        expect(stats.isSymbolicLink()).toBe(true);
      }

      await fs.writeFile('rule.md', '# Shared Rules');
      for (const target of targets) {
        const content = await fs.readFile(target, 'utf8');
        expect(content).toBe('# Shared Rules');
      }
    });

    it('user specifies custom file paths', async () => {
      await handleCreateCommand({
        file: 'rule.md',
        custom: '.custom/my-rules.md,docs/coding-standards.md'
      });

      const targets = ['.custom/my-rules.md', 'docs/coding-standards.md'];
      for (const target of targets) {
        const stats = await fs.lstat(target);
        expect(stats.isSymbolicLink()).toBe(true);
      }
    });

    it('user specifies both AI tools and custom paths', async () => {
      await handleCreateCommand({
        file: 'rule.md',
        list: ['Gemini CLI'],
        custom: '.custom/my-rules.md'
      });

      const geminiStats = await fs.lstat('GEMINI.md');
      expect(geminiStats.isSymbolicLink()).toBe(true);
      const customStats = await fs.lstat('.custom/my-rules.md');
      expect(customStats.isSymbolicLink()).toBe(true);
    });

    it('user uses custom source filename', async () => {
      await handleCreateCommand({
        file: 'my-coding-rules.md',
        list: ['Cursor']
      });

      const ruleExists = await fs.access('my-coding-rules.md').then(() => true).catch(() => false);
      expect(ruleExists).toBe(true);

      const linkTarget = await fs.readlink('.cursor/rules/coding-standards.mdc');
      expect(relative(testDir, join(testDir, '.cursor/rules', linkTarget))).toBe('my-coding-rules.md');
    });

    it('user uses custom source filename and specifies multiple AI tools to create symlinks', async () => {
      await handleCreateCommand({
        file: 'my-team-rules.md',
        list: ['Cursor', 'Windsurf']
      });

      const ruleExists = await fs.access('my-team-rules.md').then(() => true).catch(() => false);
      expect(ruleExists).toBe(true);

      const cursorLink = await fs.readlink('.cursor/rules/coding-standards.mdc');
      expect(relative(testDir, join(testDir, '.cursor/rules', cursorLink))).toBe('my-team-rules.md');

      const windsurfLink = await fs.readlink('.windsurf/rules/coding-standards.md');
      expect(relative(testDir, join(testDir, '.windsurf/rules', windsurfLink))).toBe('my-team-rules.md');
    });

    it('tool names should be compatible with case, spaces and hyphens', async () => {
      await handleCreateCommand({
        file: 'rule.md',
        list: ['cursor', 'GEMINI-cli', 'Claude Code', 'Roo-Code']
      });
      const cursorStats = await fs.lstat('.cursor/rules/coding-standards.mdc');
      expect(cursorStats.isSymbolicLink()).toBe(true);

      const geminiStats = await fs.lstat('GEMINI.md');
      expect(geminiStats.isSymbolicLink()).toBe(true);

      const claudeStats = await fs.lstat('CLAUDE.md');
      expect(claudeStats.isSymbolicLink()).toBe(true);

      const rooStats = await fs.lstat('.roo/rules/coding-standards.md');
      expect(rooStats.isSymbolicLink()).toBe(true);
    });

    it('user uses custom target filename (--target parameter)', async () => {
      await handleCreateCommand({
        file: 'rule.md',
        target: 'my-custom-rules.md',
        list: ['Cursor', 'Windsurf']
      });

      // Configurable tools use custom target filename
      const cursorStats = await fs.lstat('.cursor/rules/my-custom-rules.mdc');
      expect(cursorStats.isSymbolicLink()).toBe(true);

      const windsurfStats = await fs.lstat('.windsurf/rules/my-custom-rules.md');
      expect(windsurfStats.isSymbolicLink()).toBe(true);

      // Verify link points to correct source file
      await fs.writeFile('rule.md', '# Custom Rules');
      const cursorContent = await fs.readFile('.cursor/rules/my-custom-rules.mdc', 'utf8');
      expect(cursorContent).toBe('# Custom Rules');
    });

    it('fixed filename tools ignore --target parameter', async () => {
      await handleCreateCommand({
        file: 'rule.md',
        target: 'my-custom-rules.md',
        list: ['Claude Code', 'Gemini CLI']
      });

      // Fixed filename tools still use predefined filenames
      const claudeStats = await fs.lstat('CLAUDE.md');
      expect(claudeStats.isSymbolicLink()).toBe(true);

      const geminiStats = await fs.lstat('GEMINI.md');
      expect(geminiStats.isSymbolicLink()).toBe(true);

      // Verify custom target filename files don't exist
      const customExistsCheck = await fs.access('CLAUDE-my-custom-rules.md').then(() => true).catch(() => false);
      expect(customExistsCheck).toBe(false);
    });

    it('mixed tool types use --target parameter', async () => {
      await handleCreateCommand({
        file: 'rule.md',
        target: 'team-standards.md',
        list: ['Cursor', 'Claude Code', 'Cline']
      });

      // Configurable tools use custom target filename
      const cursorStats = await fs.lstat('.cursor/rules/team-standards.mdc');
      expect(cursorStats.isSymbolicLink()).toBe(true);

      const clineStats = await fs.lstat('.clinerules/team-standards.md');
      expect(clineStats.isSymbolicLink()).toBe(true);

      // Fixed tools use predefined filenames
      const claudeStats = await fs.lstat('CLAUDE.md');
      expect(claudeStats.isSymbolicLink()).toBe(true);
    });

    it('Cursor forces use of .mdc extension', async () => {
      await handleCreateCommand({
        file: 'rule.md',
        target: 'my-rules.txt',
        list: ['Cursor']
      });

      // Even if target file is .txt, Cursor will use .mdc
      const cursorStats = await fs.lstat('.cursor/rules/my-rules.mdc');
      expect(cursorStats.isSymbolicLink()).toBe(true);

      // Verify .txt file doesn't exist
      const txtExistsCheck = await fs.access('.cursor/rules/my-rules.txt').then(() => true).catch(() => false);
      expect(txtExistsCheck).toBe(false);
    });
  });

  describe('Error handling and edge cases', () => {
    it('user specifies non-existent AI tool should error and exit', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const processSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      await expect(handleCreateCommand({
        list: ['NonExistentTool']
      })).rejects.toThrow('process.exit called');

      expect(consoleSpy).toHaveBeenCalledWith('❌ Invalid tool name parameter:');

      consoleSpy.mockRestore();
      processSpy.mockRestore();
    });

    it('user specifies invalid target file path should error and exit', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const processSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      await expect(handleCreateCommand({
        file: 'invalid<file.md',
        list: ['Cursor']
      })).rejects.toThrow('process.exit called');

      expect(consoleSpy).toHaveBeenCalledWith('❌ Invalid source file path: File path contains invalid characters: "invalid<file.md"');

      consoleSpy.mockRestore();
      processSpy.mockRestore();
    });

    it('user specifies invalid custom path should error and exit', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const processSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
          throw new Error('process.exit called');
        });

        await expect(handleCreateCommand({
          custom: 'a/b/c,invalid<path.md',
        })).rejects.toThrow('process.exit called');

        expect(consoleSpy).toHaveBeenCalledWith('❌ Invalid custom path: File path contains invalid characters: "invalid<path.md"');

        consoleSpy.mockRestore();
        processSpy.mockRestore();
      });

    it('in non-interactive mode, existing target files should be forcefully overwritten', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Pre-create files
      await fs.mkdir('.cursor/rules', { recursive: true });
      await fs.writeFile('.cursor/rules/coding-standards.mdc', 'old content');

      await handleCreateCommand({
        file: 'rule.md',
        list: ['Cursor']
      });

      // Verify existing file is overwritten with symlink
      const stats = await fs.lstat('.cursor/rules/coding-standards.mdc');
      expect(stats.isSymbolicLink()).toBe(true);

      // Verify new content can be read
      await fs.writeFile('rule.md', '# new content');
      const newContent = await fs.readFile('.cursor/rules/coding-standards.mdc', 'utf8');
      expect(newContent).toBe('# new content');

      // Verify overwrite information is printed
      expect(consoleSpy).toHaveBeenCalledWith('\n⚠️  The following files already exist and will be overwritten:');
      expect(consoleSpy).toHaveBeenCalledWith('  - Cursor (.cursor/rules/coding-standards.mdc)');

      consoleSpy.mockRestore();
    });

    it('when no tools or custom paths provided, should prompt user', async () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
        // Simulate no targets specified in non-interactive mode
        await handleCreateCommand({ list: [], custom: '' });
        expect(consoleSpy).toHaveBeenCalledWith('🤔 No symbolic links to create. Please specify targets via --list or --custom, or run in interactive mode.');
        consoleSpy.mockRestore();
    });
  });
});

describe('rule-link interactive mode tests', () => {
    it('user selects tools and custom paths and confirms, should successfully create links', async () => {
        vi.spyOn(interactive, 'startInteractiveSelection').mockResolvedValue({
            selectedTools: [{ name: 'Cursor', directoryTemplate: '.cursor/rules', fileExtension: '.mdc', isConfigurable: true }],
            sourceFile: 'interactive-rules.md',
            targetFileName: 'coding-standards.md',
            confirmed: true,
            customPaths: ['custom/interactive.md']
        });

        // Move handleCreateCommand call after spy definition
        await handleCreateCommand({});

        // Verify source file is created
        const ruleExists = await fs.access('interactive-rules.md').then(() => true).catch(() => false);
        expect(ruleExists).toBe(true);

        // Verify AI tool symlink is created
        const cursorStats = await fs.lstat('.cursor/rules/coding-standards.mdc');
        expect(cursorStats.isSymbolicLink()).toBe(true);

        // Verify custom path symlink is created
        const customStats = await fs.lstat('custom/interactive.md');
        expect(customStats.isSymbolicLink()).toBe(true);
    });

    it('user selects to overwrite existing files in interactive mode', async () => {
        // Pre-create files
        await fs.mkdir('.cursor/rules', { recursive: true });
        await fs.writeFile('.cursor/rules/coding-standards.mdc', 'old content');
        await fs.writeFile('GEMINI.md', 'old gemini content');

        // Simulate interaction, user chooses to overwrite Cursor and Gemini
        vi.spyOn(interactive, 'startInteractiveSelection').mockResolvedValue({
            selectedTools: [
                { name: 'Cursor', directoryTemplate: '.cursor/rules', fileExtension: '.mdc', isConfigurable: true },
                { name: 'Gemini CLI', fileName: 'GEMINI.md', isConfigurable: false }
            ],
            sourceFile: 'rule.md',
            targetFileName: 'coding-standards.md',
            confirmed: true,
            customPaths: []
        });

        // Simulate user only choosing to overwrite Cursor
        const promptSpy = vi.spyOn(interactive, 'promptForOverwrite').mockResolvedValue([
            { name: 'Cursor', path: '.cursor/rules/coding-standards.mdc' }
        ]);

        await handleCreateCommand({});

        // Verify selected file for overwrite becomes symlink
        const cursorStats = await fs.lstat('.cursor/rules/coding-standards.mdc');
        expect(cursorStats.isSymbolicLink()).toBe(true);

        // Verify unselected file for overwrite remains unchanged
        const geminiStats = await fs.lstat('GEMINI.md');
        expect(geminiStats.isSymbolicLink()).toBe(false);
        const geminiContent = await fs.readFile('GEMINI.md', 'utf8');
        expect(geminiContent).toBe('old gemini content');

        promptSpy.mockRestore();
    });

    it('user cancels operation at final confirmation, should not create any files', async () => {
        const startInteractiveSelectionSpy = vi.spyOn(interactive, 'startInteractiveSelection').mockResolvedValue({
            selectedTools: [{ name: 'Cursor', directoryTemplate: '.cursor/rules', fileExtension: '.mdc', isConfigurable: true }],
            sourceFile: 'rule.md',
            targetFileName: 'coding-standards.md',
            confirmed: false, // User cancels
            customPaths: []
        });

        await handleCreateCommand({});

        expect(startInteractiveSelectionSpy).toHaveBeenCalled();

        // Verify no files or directories are created
        const cursorExists = await fs.access('.cursor/rules/coding-standards.mdc').then(() => true).catch(() => false);
        expect(cursorExists).toBe(false);
        const ruleExists = await fs.access('rule.md').then(() => true).catch(() => false);
        expect(ruleExists).toBe(false);
    });
});
