import { promises as fs } from 'fs';
import { dirname, resolve, relative } from 'path';
import { getSupportedToolNames, findAIToolByName } from './config.js';

/**
 * Validate the legality of the file path
 * @param filePath - File path
 * @returns Validation result
 */
export function validateFilePath(filePath: string): { valid: boolean; error?: string } {
    if (!filePath || filePath.trim() === '') {
        return { valid: false, error: 'File path cannot be empty' };
    }
    // A simple check for invalid characters.
    const invalidChars = /[<>:"|?*]/;
    if (invalidChars.test(filePath)) {
        return { valid: false, error: `File path contains invalid characters: "${filePath}"` };
    }
    if (filePath.length > 260) {
        return { valid: false, error: `File path is too long: "${filePath}"` };
    }
    return { valid: true };
}

/**
 * Parse custom path string
 * @param customPaths - Comma-separated path string
 * @returns Parsed path array
 */
export function parseCustomPaths(customPaths: string): string[] {
    if (!customPaths) return [];
    return customPaths.split(',').map(p => p.trim()).filter(p => p.length > 0);
}


/**
 * Ensure the source file exists, create an empty file if it does not
 * @param sourcePath - Source file path
 */
async function ensureSourceFile(sourcePath: string): Promise<void> {
    try {
        await fs.access(sourcePath);
    } catch {
        await fs.mkdir(dirname(sourcePath), { recursive: true });
        await fs.writeFile(sourcePath, '', 'utf8');
    }
}

/**
 * Create a single symlink
 * @param sourcePath - Source file path (the file the symlink points to)
 * @param targetPath - Target file path (the symlink to be created)
 * @returns Operation result
 */
async function createSingleSymlink(sourcePath: string, targetPath: string): Promise<{ success: boolean; error?: string }> {
    try {
        const resolvedSource = resolve(sourcePath);
        const resolvedTarget = resolve(targetPath);

        // 1. Ensure source file exists
        await ensureSourceFile(resolvedSource);

        // 2. Ensure target directory exists
        await fs.mkdir(dirname(resolvedTarget), { recursive: true });

        // 3. Create a relative symlink
        const relativeSource = relative(dirname(resolvedTarget), resolvedSource);
        await fs.symlink(relativeSource, resolvedTarget, 'file');

        return { success: true };
    } catch (error: any) {
        // Provide more specific error messages
        if (error.code === 'EEXIST') {
            return { success: false, error: 'File already exists' };
        }
        if (error.code === 'EPERM' || error.code === 'EACCES') {
            return { success: false, error: 'Permission denied' };
        }
        return { success: false, error: error.message || 'Unknown error' };
    }
}

/**
 * Create symlinks in batch
 * @param sourcePath - Source file path
 * @param targets - Array of target objects, containing path and name
 * @returns Creation result
 */
export async function createSymlinks(
    sourcePath: string,
    targets: { path: string; name: string }[]
): Promise<{ success: boolean; createdFiles: string[] }> {
    const createdFiles: string[] = [];
    let allSuccess = true;

    const results = await Promise.all(
        targets.map(target => createSingleSymlink(sourcePath, target.path))
    );

    for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const target = targets[i];

        if (result.success) {
            createdFiles.push(target.path);
        } else {
            allSuccess = false;
            console.error(`❌ ${target.name} (${target.path}): ${result.error}`);
        }
    }

    return { success: allSuccess, createdFiles };
}

/**
 * Validate AI tool name list
 * @param toolNames - Array of tool names
 * @returns Validation result and error messages
 */
export function validateToolNames(toolNames: string[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const supportedTools = getSupportedToolNames();

    for (const toolName of toolNames) {
        if (!findAIToolByName(toolName)) {
            errors.push(`Unsupported AI tool: "${toolName}"`);
        }
    }

    if (errors.length > 0) {
        errors.push(`Supported tools: ${supportedTools.join(', ')}`)
    }

    return {
        valid: errors.length === 0,
        errors
    };
}