# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm install` - Install dependencies (project uses pnpm exclusively)
- `pnpm run build` - Build the project using tsdown and build the binary
- `pnpm run dev` - Start development mode with watch mode
- `pnpm run test` - Run tests with Vitest
- `pnpm run typecheck` - Run TypeScript type checking
- `pnpm run release` - Bump version and publish to npm

## Project Architecture

rule-link is a CLI tool that creates symbolic links to unify AI programming tool rule files across multiple AI assistants (Cursor, Windsurf, Claude Code, etc.).

### Core Components

- **src/cli.ts** - Main CLI entry point using Commander.js, handles command parsing and execution
- **src/config.ts** - AI tool configuration mapping (SUPPORTED_AI_TOOLS array with tool names and file paths)
- **src/interactive.ts** - Interactive UI using @inquirer/prompts for tool selection
- **src/utils.ts** - Core symlink creation utilities and validation functions
- **src/types.ts** - TypeScript interfaces for AITool and CreateOptions

### Key Design Patterns

The tool creates symbolic links from a single source rule file (default: rule.md) to multiple AI tool-specific locations. This allows developers to maintain one set of rules that automatically sync across all supported AI tools.

### Build Process

- Uses tsdown for TypeScript compilation with dual builds: index.ts (neutral platform) and cli.ts (Node.js platform)
- bin/rule-link.js is the executable entry point that imports the compiled CLI
- Build script makes the binary executable with chmod 755

### Supported AI Tools

- Cursor: `.cursor/rules/coding-standards.mdc`
- Windsurf: `.windsurf/rules/coding-standards.md`
- Claude Code: `CLAUDE.md`
- Gemini CLI: `GEMINI.md`
- Cline: `.clinerules/coding-standards.md`
- Roo Code: `.roo/rules/coding-standards.md`

### Error Handling

The tool includes comprehensive validation for file paths, permissions, and symlink creation failures with platform-specific error messages.

## Testing

Tests are written with Vitest. The project focuses on testing core business logic, file system operations, and cross-platform compatibility.