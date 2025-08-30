# Design Document

## Overview

rule-link is a concise command-line tool that unifies the management of rule files for multiple AI programming tools into a single `rule.md` file by creating symbolic links. The tool supports cross-platform operation and offers both interactive and command-line argument modes.

## Core Mechanism: Symbolic Link Implementation

### How Symbolic Links Work

The core of rule-link is to use the operating system's symbolic link feature to point the rule files of multiple AI tools to the same source file:

```
Project Directory/
├── rule.md                           # Unified rule source file
├── .cursor/rules/coding-standards.mdc  # -> ../../rule.md (configurable)
├── .windsurf/rules/coding-standards.md # -> ../../rule.md (configurable)
├── CLAUDE.md                        # -> rule.md (fixed file name)
└── GEMINI.md                        # -> rule.md (fixed file name)
```

### Symbolic Link Creation Process

1.  **Check Source File**: Confirm that `rule.md` exists; if not, create an empty file.
2.  **Validate Target Path**: Check the validity of the AI tool's rule file path.
3.  **Handle Existing Files**: If the target file already exists, ask the user whether to overwrite it.
4.  **Create Symbolic Link**: Use `fs.symlink()` to create the symbolic link.
5.  **Verify Link**: Confirm that the symbolic link was created successfully and points to the correct target.

### Cross-Platform Compatibility

**Windows**:
- Use `fs.symlink(target, path, 'file')`
- Requires administrator privileges or developer mode to be enabled.
- Provides a friendly prompt when permissions are insufficient.

**macOS/Linux**:
- Use `fs.symlink(target, path)`
- Usually does not require special permissions.
- Supports relative and absolute paths.

### Symbolic Link Management Strategy

**Pre-Creation Checks**:
- Verify the existence of the source file.
- Check if the target file already exists.
- Verify file system permissions.

**Error Handling**:
- Insufficient permissions: Provide a solution prompt.
- File already exists: Ask whether to overwrite.
- Cross-device links: Automatically downgrade to file copy.

**Link Verification**:
- Check if the symbolic link is valid.
- Verify that the link target is correct.
- Handle broken links.

## Architecture

### Overall Architecture

```
rule-link/
├── src/
│   ├── cli.ts              # CLI entry point and command parsing
│   ├── core.ts             # Core business logic (symbolic link management)
│   ├── config.ts           # AI tool configuration
│   └── types.ts            # Type definitions
├── bin/
│   └── rule-link.js        # Executable file
└── tests/                  # Test files
```

### Technology Stack

- **Runtime**: Node.js (>=18)
- **Language**: TypeScript
- **CLI**: Commander.js + @inquirer/prompts
- **File Operations**: Node.js fs/promises (core of symbolic links)
- **Testing**: Vitest

## Components and Interfaces

### Core Commands

#### create Command
The only main command, supporting two modes of use:

**Interactive Mode**:
```bash
rule-link create
```
Displays a list of AI tools for the user to select from (multiple selections allowed).

**Command-Line Argument Mode**:
```bash
rule-link create --file rule.md --target coding-standards.md --list Cursor Windsurf "Claude Code"
```
- `--file`: Specify the path to the source rule file (default: `rule.md`).
- `--target`: Specify the target file name for AI tools (default: `coding-standards.md`).
- `--list`: Specify a list of AI tools for which to create links, skipping the interactive selection.
- `--custom`: Specify custom rule file paths, supporting multiple files separated by commas.

### Supported AI Tools

The AI tools are divided into two categories based on their file naming requirements:

**Configurable Target File Tools** (affected by `--target` parameter, default: `coding-standards.md`):
- **Cursor**: `.cursor/rules/{target-file}` (with `.mdc` extension)
- **Windsurf**: `.windsurf/rules/{target-file}`
- **Cline**: `.clinerules/{target-file}`
- **Roo Code**: `.roo/rules/{target-file}`

**Fixed File Name Tools** (not affected by `--target` parameter):
- **Claude Code**: `CLAUDE.md` (fixed file name)
- **Gemini CLI**: `GEMINI.md` (fixed file name)

### Target File Name Generation Logic

The tool generates file paths differently based on the tool type:

1. **Configurable Target File Tools**:
   - Use the `--target` parameter to generate file paths
   - Combine their specific directory with the target file name
   - Example: `--target my-rules.md` → `.cursor/rules/my-rules.mdc`, `.windsurf/rules/my-rules.md`

2. **Fixed File Name Tools**:
   - Ignore the `--target` parameter completely
   - Always use their predefined file names
   - Example: Always create `CLAUDE.md` and `GEMINI.md` regardless of `--target`

3. **Extension handling**:
   - **Cursor**: Always uses `.mdc` extension (replaces target extension)
   - **Other configurable tools**: Preserve the target file extension
   - **Fixed file name tools**: Use their predefined extensions

**Example Usage**:
```bash
# Using custom target file name
rule-link create --target my-coding-rules.md --list Cursor Windsurf Claude

# Results:
# .cursor/rules/my-coding-rules.mdc  -> rule.md
# .windsurf/rules/my-coding-rules.md -> rule.md
# CLAUDE.md                          -> rule.md (ignores --target)
```

### Custom Rule File Support

In addition to the default supported AI tools, users can specify custom rule file paths:

**Command-Line Argument Mode**:
```bash
rule-link create --target coding-standards.md --custom ".custom/my-rules.md,docs/project-rules.md"
```

**Interactive Mode**:
In the interactive selection interface, users can enter custom file paths, supporting multiple paths separated by commas:

```
Please enter custom rule file paths (separate multiple files with commas):
.custom/my-rules.md,docs/project-rules.md
```

**Custom File Handling Logic**:
1.  Validate the legality of the file path.
2.  Check if the file exists (optional).
3.  Create a symbolic link to the target rule file.
4.  Support relative and absolute paths.
5.  Automatically create the necessary directory structure.

### Core Interfaces

#### AITool
AI tool configuration interface, containing the tool name and corresponding file name.

#### CreateOptions
Options interface for the `create` command, including the source file path, target file name, tool list, and custom file paths.

#### SymlinkManager
Symbolic link management interface, responsible for creating, verifying, and managing symbolic links.

## Data Models

### AITool
```typescript
interface AITool {
  name: string;
  fileName?: string;          // Fixed file name (for Claude, Gemini)
  directoryTemplate?: string; // Directory template for configurable tools
  fileExtension?: string;     // Extension override (e.g., ".mdc" for Cursor)
  isConfigurable: boolean;    // Whether this tool supports --target parameter
}
```

### CreateOptions
```typescript
interface CreateOptions {
  file?: string;    // Source rule file path (default: "rule.md")
  target?: string;  // Target file name for AI tools (default: "coding-standards.md")
  list?: string[];  // List of AI tools
  custom?: string;  // Custom file paths
}
```

## Error Handling

### Main Error Types
- File permission errors
- Symbolic link creation failure
- Invalid AI tool name
- Target file does not exist
- Incorrect custom file path format
- Custom file path contains illegal characters

### Error Handling Strategy
1.  Provide clear error messages and solution suggestions.
2.  Validate the legality of user input.
3.  Check file system permissions and status.
4.  Cross-platform compatibility checks.

## Testing Strategy

### Test Scope
- Core business logic testing
- CLI command argument parsing testing
- File system operation testing
- Cross-platform compatibility testing
- Error scenario handling testing

### Performance Requirements
- Command execution time: <5 seconds
- Support for concurrent creation of multiple symbolic links
- Asynchronous file operations

## Deployment Configuration

### NPM Package Configuration
- Support for global installation
- Provide an executable `rule-link` command
- Cross-platform support (Windows, macOS, Linux)
- Node.js >=18 runtime requirement
