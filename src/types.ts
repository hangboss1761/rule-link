/**
 * Core type definitions for rule-link CLI tool
 */

/**
 * AI tool configuration interface, defines the tool name and file generation rules
 */
export interface AITool {
  /** Display name of the AI tool */
  name: string;
  /** Fixed file name (for tools like Claude, Gemini that don't support custom target names) */
  fileName?: string;
  /** Directory template for configurable tools (e.g., ".cursor/rules") */
  directoryTemplate?: string;
  /** File extension override (e.g., ".mdc" for Cursor) */
  fileExtension?: string;
  /** Whether this tool supports --target parameter */
  isConfigurable: boolean;
}

/**
 * Options interface for the create command
 */
export interface CreateOptions {
  /** Source rule file path, defaults to rule.md */
  file?: string;
  /** Target file name for AI tools, defaults to coding-standards.md */
  target?: string;
  /** List of AI tools to create links for, used to skip interactive selection */
  list?: string[];
  /** Custom rule file paths, supports multiple files separated by commas */
  custom?: string;
}