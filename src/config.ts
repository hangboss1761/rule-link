/**
 * AI tool configuration constant definition
 */

import type { AITool } from './types.js';

/**
 * List of supported AI tool configurations
 * Contains rule file mappings for mainstream AI programming tools
 */
export const SUPPORTED_AI_TOOLS: readonly AITool[] = [
  {
    name: 'Cursor',
    directoryTemplate: '.cursor/rules',
    fileExtension: '.mdc',
    isConfigurable: true
  },
  {
    name: 'Augment',
    directoryTemplate: '.augment/rules',
    isConfigurable: true
  },
  {
    name: 'Windsurf',
    directoryTemplate: '.windsurf/rules',
    isConfigurable: true
  },
  {
    name: 'Claude Code',
    fileName: 'CLAUDE.md',
    isConfigurable: false
  },
  {
    name: 'Gemini CLI',
    fileName: 'GEMINI.md',
    isConfigurable: false
  },
  {
    name: 'Cline',
    directoryTemplate: '.clinerules',
    isConfigurable: true
  },
  {
    name: 'Roo Code',
    directoryTemplate: '.roo/rules',
    isConfigurable: true
  }
] as const;

/**
 * Default rule file name
 */
export const DEFAULT_RULE_FILE = 'rule.md';

/**
 * Default target file name for configurable AI tools
 */
export const DEFAULT_TARGET_FILE = 'coding-standards.md';

/**
 * Normalize tool name for fuzzy matching
 * (Removes spaces, hyphens, and converts to lowercase)
 * @param name - Tool name
 * @returns Normalized name
 */
function normalizeToolName(name: string): string {
  return name.replace(/[-\s]/g, '').toLowerCase();
}

/**
 * Find the corresponding AI tool configuration by tool name
 * @param toolName - AI tool name
 * @returns The corresponding AITool configuration, or undefined if not found
 */
export function findAIToolByName(toolName: string): AITool | undefined {
  const normalizedToolName = normalizeToolName(toolName);
  return SUPPORTED_AI_TOOLS.find(tool =>
    normalizeToolName(tool.name) === normalizedToolName
  );
}

/**
 * Get a list of all supported AI tool names
 * @returns Array of AI tool names
 */
export function getSupportedToolNames(): string[] {
  return SUPPORTED_AI_TOOLS.map(tool => tool.name);
}

/**
 * Generate the actual file name for an AI tool based on target file name
 * @param tool - AI tool configuration
 * @param targetFileName - Target file name (e.g., "coding-standards.md")
 * @returns The actual file path for the tool
 */
export function generateToolFileName(tool: AITool, targetFileName: string): string {
  // For tools with fixed file names, ignore the target file name
  if (!tool.isConfigurable && tool.fileName) {
    return tool.fileName;
  }

  // For configurable tools, generate the file path
  if (tool.isConfigurable && tool.directoryTemplate) {
    let fileName = targetFileName;

    // Apply file extension override if specified (e.g., Cursor uses .mdc)
    if (tool.fileExtension) {
      const nameWithoutExt = targetFileName.replace(/\.[^/.]+$/, '');
      fileName = nameWithoutExt + tool.fileExtension;
    }

    return `${tool.directoryTemplate}/${fileName}`;
  }

  // Fallback - should not happen with proper configuration
  return targetFileName;
}

/**
 * Get the display name for an AI tool showing its target file path
 * @param tool - AI tool configuration
 * @param targetFileName - Target file name
 * @returns Display string for the tool
 */
export function getToolDisplayName(tool: AITool, targetFileName: string): string {
  const actualFileName = generateToolFileName(tool, targetFileName);
  return `${tool.name} (${actualFileName})`;
}