/**
 * Interactive user interface implementation using @inquirer/prompts
 */

import { checkbox, input, confirm } from '@inquirer/prompts';
import type { AITool } from './types.js';
import { SUPPORTED_AI_TOOLS, DEFAULT_TARGET_FILE, getToolDisplayName, generateToolFileName } from './config.js';
import { validateFilePath, parseCustomPaths } from './utils.js';

/**
 * Interactive Selection Result Interface
 */
export interface InteractiveSelectionResult {
  /** List of selected AI tools */
  selectedTools: AITool[];
  /** Source rule file path */
  sourceFile: string;
  /** Target file name for AI tools */
  targetFileName: string;
  /** Whether the user confirms to continue */
  confirmed: boolean;
  /** List of custom file paths */
  customPaths?: string[];
}

/**
 * Interactive Selection Options
 */
export interface InteractiveOptions {
  /** Default source file path */
  defaultFile?: string;
  /** Default target file name */
  defaultTarget?: string;
}


/**
 * Prompt user to select files to overwrite
 * @param existingTargets - List of existing targets
 * @returns List of targets selected by the user to overwrite
 */
export async function promptForOverwrite(
  existingTargets: { path: string; name: string }[]
): Promise<{ path: string; name: string }[]> {
  const selectedToOverwrite = await checkbox({
    message: 'The following files already exist. Please select the files to overwrite:',
    choices: existingTargets.map(t => ({
      name: `${t.name} (${t.path})`,
      value: t,
      checked: true
    })),
  });
  return selectedToOverwrite;
}

/**
 * Start interactive AI tool selection process
 */
export async function startInteractiveSelection(
  options: InteractiveOptions = {}
): Promise<InteractiveSelectionResult | null> {
  console.log('\n🔗 rule-link - AI Tool Rule File Unifier');
  console.log('Unify the management of rule files for multiple AI tools by creating symbolic links\n');

  try {
    // 1. Enter the target file name first (to show in tool selection)
    const targetFileName = await input({
      message: 'Please enter the target file name for AI tools:',
      default: options.defaultTarget || DEFAULT_TARGET_FILE,
      validate: (name) => {
        if (!name.trim()) return 'Target file name cannot be empty';
        // Basic file name validation (no path separators)
        if (name.includes('/') || name.includes('\\')) {
          return 'Target file name should not contain path separators';
        }
        return true;
      }
    });

    // 2. Select AI tools (show actual file paths based on target name)
    const selectedToolNames = await checkbox({
      message: 'Please select the AI tools for which you want to create rule file links:',
      choices: SUPPORTED_AI_TOOLS.map(tool => ({
        name: getToolDisplayName(tool, targetFileName),
        value: tool.name
      })),
      validate: (choices) => choices.length > 0 ? true : 'Please select at least one AI tool'
    });

    const selectedTools = selectedToolNames
      .map(name => SUPPORTED_AI_TOOLS.find(t => t.name === name))
      .filter(Boolean) as AITool[];

    // 3. Enter the source rule file path
    const sourceFile = await input({
      message: 'Please enter the source rule file path:',
      default: options.defaultFile || 'rule.md',
      validate: (path) => {
        const validation = validateFilePath(path);
        return validation.valid ? true : validation.error!;
      }
    });

    // 4. Enter custom file paths (optional)
    const customPathsInput = await input({
      message: 'Please enter custom rule file paths (comma-separated, skip if empty):',
      validate: (paths) => {
        if (!paths.trim()) return true;
        const parsed = parseCustomPaths(paths);
        for (const path of parsed) {
          const validation = validateFilePath(path);
          if (!validation.valid) {
            return validation.error!;
          }
        }
        return true;
      }
    });

    const customPaths = parseCustomPaths(customPathsInput);

    // 5. Display operation summary and confirm
    console.log(`\n📋 Operation Summary:`);
    console.log(`   Source file: ${sourceFile}`);
    console.log(`   Target file name: ${targetFileName}`);
    console.log(`   Selected tools (${selectedTools.length}):`);
    selectedTools.forEach(tool => {
      const actualPath = generateToolFileName(tool, targetFileName);
      const configStatus = tool.isConfigurable ? '' : ' (fixed file name)';
      console.log(`     • ${tool.name} → ${actualPath}${configStatus}`);
    });

    if (customPaths.length > 0) {
      console.log(`   Custom files (${customPaths.length}):`);
      customPaths.forEach(path => console.log(`     • ${path} → ${sourceFile}`));
    }
    console.log('');

    const confirmed = await confirm({
      message: 'Confirm the creation of the above symbolic links?',
      default: true
    });

    return { selectedTools, sourceFile, targetFileName, confirmed, customPaths };

  } catch (error) {
    // Inquirer throws an error on Ctrl+C, which is a graceful exit.
    if (error instanceof Error && error.message.includes('User force closed')) {
        console.log('\n❌ Operation cancelled');
        return null;
    }
    console.error('❌ Interactive selection failed:', error instanceof Error ? error.message : String(error));
    return null;
  }
}


