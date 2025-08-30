/**
 * rule-link - AI Tool Rule File Unifier
 *
 * Main entry point for the rule-link library
 * Provides programmatic access to all public APIs
 */

// Import all functions and constants
import { createCLI, cli, handleCreateCommand } from './cli.js';
import {
  SUPPORTED_AI_TOOLS,
  DEFAULT_RULE_FILE,
  DEFAULT_TARGET_FILE,
  findAIToolByName,
  getSupportedToolNames,
  generateToolFileName,
  getToolDisplayName
} from './config.js';
import {
  startInteractiveSelection,
  promptForOverwrite,
  type InteractiveSelectionResult,
  type InteractiveOptions
} from './interactive.js';
import {
  createSymlinks,
  validateFilePath,
  parseCustomPaths,
  validateToolNames
} from './utils.js';

// Re-export everything
export { createCLI, cli, handleCreateCommand };
export {
  SUPPORTED_AI_TOOLS,
  DEFAULT_RULE_FILE,
  DEFAULT_TARGET_FILE,
  findAIToolByName,
  getSupportedToolNames,
  generateToolFileName,
  getToolDisplayName
};
export {
  startInteractiveSelection,
  promptForOverwrite,
  type InteractiveSelectionResult,
  type InteractiveOptions
};
export {
  createSymlinks,
  validateFilePath,
  parseCustomPaths,
  validateToolNames
};

// Export type definitions
export type { AITool, CreateOptions } from './types.js';

// Default export for convenience
export default {
  createCLI,
  cli,
  handleCreateCommand,
  SUPPORTED_AI_TOOLS,
  DEFAULT_RULE_FILE,
  DEFAULT_TARGET_FILE,
  findAIToolByName,
  getSupportedToolNames,
  generateToolFileName,
  getToolDisplayName,
  startInteractiveSelection,
  createSymlinks,
  validateFilePath,
  parseCustomPaths,
  validateToolNames
};