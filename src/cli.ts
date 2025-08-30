#!/usr/bin/env node

import { Command } from 'commander';
import { readFileSync, promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import type { CreateOptions, AITool } from './types.js';
import { getSupportedToolNames, findAIToolByName, DEFAULT_TARGET_FILE, generateToolFileName } from './config.js';
import { startInteractiveSelection } from './interactive.js';
import { createSymlinks, validateFilePath, parseCustomPaths, validateToolNames } from './utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Get package version information
 */
function getPackageVersion(): string {
    try {
        const packagePath = join(__dirname, '../package.json');
        const packageJson = JSON.parse(readFileSync(packagePath, 'utf-8'));
        return packageJson.version || '0.0.0';
    } catch {
        return '0.0.0';
    }
}

/**
 * Handle the execution of the create command
 * @param options - Command options
 */
export async function handleCreateCommand(options: CreateOptions): Promise<void> {
    try {
        // validate source file path
        let sourceFile = options.file || 'rule.md';
        const fileValidation = validateFilePath(sourceFile);
        if (!fileValidation.valid) {
            console.error(`❌ Invalid source file path: ${fileValidation.error}`);
            process.exit(1);
        }

        let selectedTools: AITool[] = [];
        let customPaths: string[] = [];
        let targetFileName: string;

        // mode check: interactive or command line
        const isInteractive = !options.list && !options.custom;

        if (isInteractive) {
            // Interactive mode
            const result = await startInteractiveSelection({
                defaultFile: sourceFile,
                defaultTarget: options.target || DEFAULT_TARGET_FILE
            });
            if (!result || !result.confirmed) {
                console.log('❌ Operation cancelled');
                return;
            }
            selectedTools = result.selectedTools;
            customPaths = result.customPaths || [];
            sourceFile = result.sourceFile;
            targetFileName = result.targetFileName;
        } else {
            // command line mode
            targetFileName = options.target || DEFAULT_TARGET_FILE;

            if (options.list) {
                const toolValidation = validateToolNames(options.list);
                if (!toolValidation.valid) {
                    console.error('❌ Invalid tool name parameter:');
                    toolValidation.errors.forEach(error => console.error(`  ${error}`));
                    process.exit(1);
                }
                selectedTools = options.list
                    .map(name => findAIToolByName(name))
                    .filter(Boolean) as AITool[];
            }
            if (options.custom) {
                const parsedPaths = parseCustomPaths(options.custom);
                for (const path of parsedPaths) {
                    const pathValidation = validateFilePath(path);
                    if (!pathValidation.valid) {
                        console.error(`❌ Invalid custom path: ${pathValidation.error}`);
                        process.exit(1);
                    }
                }
                customPaths = parsedPaths;
            }
        }

        // prepare targets to create
        const targets: { path: string; name: string }[] = [];
        selectedTools.forEach(tool => {
            const actualPath = generateToolFileName(tool, targetFileName);
            targets.push({ path: actualPath, name: tool.name });
        });
        customPaths.forEach(path => targets.push({ path, name: path }));

        if (targets.length === 0) {
            console.log('🤔 No symbolic links to create. Please specify targets via --list or --custom, or run in interactive mode.');
            return;
        }

        const existingTargets: { path: string; name: string }[] = [];
        const newTargets: { path: string; name: string }[] = [];

        for (const target of targets) {
            try {
                await fs.lstat(resolve(target.path));
                existingTargets.push(target);
            } catch (error: any) {
                if (error.code === 'ENOENT') {
                    newTargets.push(target);
                } else {
                    console.error(`❌ Error checking file \"${target.path}\": ${error.message}`);
                    process.exit(1);
                }
            }
        }

        let targetsToOverwrite: { path: string; name: string }[] = [];
        if (existingTargets.length > 0) {
            if (isInteractive) {
                const { promptForOverwrite } = await import('./interactive.js');
                const selectedToOverwrite = await promptForOverwrite(existingTargets);
                targetsToOverwrite = selectedToOverwrite;
            } else {
                // Non-interactive mode, force overwrite
                console.log('\n⚠️  The following files already exist and will be overwritten:');
                existingTargets.forEach(t => console.log(`  - ${t.name} (${t.path})`));
                targetsToOverwrite = existingTargets;
            }
        }

        const targetsToCreate = [...newTargets, ...targetsToOverwrite];

        if (targetsToCreate.length === 0) {
            console.log('🤔 No symbolic links to create.');
            return;
        }

        for (const target of targetsToOverwrite) {
            try {
                await fs.unlink(resolve(target.path));
            } catch (error: any) {
                console.error(`❌ Failed to delete old file \"${target.path}\": ${error.message}`);
                process.exit(1);
            }
        }

        console.log(`
🚀 Creating symbolic links for ${targetsToCreate.length} targets...`);
        const batchResult = await createSymlinks(sourceFile, targetsToCreate);

        if (batchResult.success) {
            console.log(`
🎉 Successfully created ${batchResult.createdFiles.length} symbolic links for ${sourceFile}.`);
            console.log('💡 It is recommended to add the generated rule files to .gitignore');
        } else {
            console.error('\n❌ Some symbolic links failed to be created. Please check the error messages above.');
            process.exit(1);
        }

    } catch (error) {
        console.error(`\n❌ Operation failed: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
    }
}


/**
 * Create and configure the CLI program
 */
export function createCLI(): Command {
    const program = new Command();

    program
        .name('rule-link')
        .description('Unify the management of rule files for multiple AI programming tools')
        .version(getPackageVersion(), '-v, --version', 'Display version information');

    // create command
    program
        .command('create')
        .description('Create symbolic links for AI tool rule files')
        .option('-f, --file <path>', 'Specify the source rule file path', 'rule.md')
        .option('-t, --target <name>', 'Specify the target file name for AI tools', DEFAULT_TARGET_FILE)
        .option('-l, --list <tools...>', 'Specify the list of AI tools to link, skipping interactive selection')
        .option('-c, --custom <paths>', 'Specify custom rule file paths, supporting multiple files separated by commas')
        .addHelpText('after', `
Examples:
  $ rule-link create                                    # Interactively select AI tools
  $ rule-link create --file my-rules.md                # Specify the source rule file
  $ rule-link create --target my-standards.md          # Specify target file name
  $ rule-link create --list Cursor Windsurf            # Directly specify the tool list
  $ rule-link create --target my-rules.md --list Cursor Claude # Custom target with specific tools
  $ rule-link create --custom ".custom/my-rules.md,docs/project-rules.md" # Specify custom files

Supported AI tools:
  ${getSupportedToolNames().map(name => `• ${name}`).join('\n  ')}

Note: Claude Code and Gemini CLI use fixed file names (CLAUDE.md, GEMINI.md) and ignore --target parameter.
`)
        .action(handleCreateCommand);

    // Add global help information
    program.addHelpText('beforeAll', `
rule-link - AI Tool Rule File Unifier
`);

    return program;
}

/**
 * CLI entry function
 */
export async function cli(): Promise<void> {
    const program = createCLI();

    // Handle unknown commands
    program.on('command:*', (operands: string[]) => {
        console.error(`❌ Unknown command: ${operands[0]}`);
        console.log('Use --help to see available commands');
        process.exit(1);
    });

    // Parse command line arguments
    try {
        await program.parseAsync(process.argv);
    } catch (error) {
        console.error('❌ Command parsing failed:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}

