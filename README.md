# rule-link

[![npm version](https://img.shields.io/npm/v/rule-link.svg)](https://www.npmjs.com/package/rule-link)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**rule-link** is a command-line tool designed to help developers unify the management of configuration rule files for multiple AI programming tools. By creating symbolic links to a single, centralized rule file (e.g., `rule.md`), you can maintain consistency across different AI assistants (like Cursor, Windsurf, Claude Code, etc.) without duplicating and manually synchronizing multiple files.

## The Problem It Solves

Many AI coding assistants rely on a project-specific file (e.g., `CLAUDE.md`, `GEMINI.md`) to understand the context and coding conventions of your project. If you use multiple such tools, you end up with several rule files that are often identical. Keeping them in sync is tedious and error-prone. `rule-link` solves this by linking all of them to a single source of truth.

## Features

- **Unified Management**: Create and manage symbolic links from a single source file to multiple AI tool configuration files.
- **Built-in Support**: Comes with pre-configured paths for popular AI tools like Cursor, Claude Code, Gemini CLI, and more.
- **Universal Compatibility**: Use `--custom` flag to create links for any AI tool, even those not officially supported.
- **Interactive UI**: A user-friendly interactive interface to select the AI tools you want to configure.
- **Command-Line Power**: Supports direct command-line arguments for automation and scripting in CI/CD environments.
- **Cross-Platform**: Works consistently across Windows, macOS, and Linux.

## Built-in AI Tools

`rule-link` comes with built-in support for the following popular AI tools:

| Tool Name     | File Path                             |
|---------------|---------------------------------------|
| Cursor        | `.cursor/rules/coding-standards.mdc`  |
| Augment       | `.augment/rules/coding-standards.md`  |
| Windsurf      | `.windsurf/rules/coding-standards.md` |
| Claude Code   | `CLAUDE.md`                           |
| Gemini CLI    | `GEMINI.md`                           |
| Cline         | `.clinerules/coding-standards.md`     |
| Roo Code      | `.roo/rules/coding-standards.md`      |

## Custom AI Tools

While `rule-link` provides built-in support for popular tools, you can create symbolic links for **any AI tool** using the `--custom <paths>` flag. This allows you to:

- Link to tools not officially supported
- Use custom file paths for your specific workflow
- Support enterprise or internal AI tools
- Maintain consistency across any number of AI assistants

Simply provide a comma-separated list of custom file paths:

```bash
rule-link create --custom ".vscode/rules.md,enterprise.md,.ai-tools/custom-rules.md"
```

## Installation

```bash
npm install -g rule-link
```

## Usage

The primary command is `rule-link create`. You can run it in interactive mode or with command-line flags.

### Interactive Mode

For a guided experience, simply run the command without any options. The tool will prompt you to select the desired AI tools and confirm the paths.

```bash
rule-link create
```

### Command-Line Mode

For scripting or quick use, you can pass arguments directly.

**1. Specify AI tools directly:**

Use the `--list` flag to provide a space-separated list of tool names.

```bash
# Create links for Cursor and Windsurf
rule-link create --list Cursor Windsurf
```

**2. Specify a different source file:**

By default, `rule-link` uses `rule.md` as the source of truth. You can specify a different file with the `--file` flag.

```bash
# Use my-rules.md as the source file
rule-link create --file my-rules.md --list Cursor
```

**3. Link custom file paths:**

If you need to link to a file not officially supported, use the `--custom` flag with a comma-separated list of paths.

```bash
# Link two custom files
rule-link create --custom ".custom/coding-standards.md,docs/project-rules.md"
```

## Recommended Workflow

### Initial Project Setup

1.  **Run the command**:
    ```bash
    rule-link create
    ```
2.  **Follow the prompts** to select your preferred AI tools and create the `rule.md` source file and all the necessary symbolic links.
3.  **Commit the source file**:
    Commit the `rule.md` (or your custom source file) to your Git repository.
4.  **Ignore the links**:
    Add the generated symbolic link files to your `.gitignore`. This is crucial because symbolic links can behave differently across operating systems (Windows vs. macOS/Linux).

    **Example `.gitignore`:**
    ```gitignore
    # AI tool rule files managed by rule-link
    .cursor/rules/coding-standards.mdc
    .augment/rules/coding-standards.md
    .windsurf/rules/coding-standards.md
    CLAUDE.md
    GEMINI.md
    .clinerules/coding-standards.md
    .roo/rules/coding-standards.md

    # Or if using custom target file name with --target:
    # .cursor/rules/your-custom-name.mdc
    # .augment/rules/your-custom-name.md
    # .windsurf/rules/your-custom-name.md
    # .clinerules/your-custom-name.md
    # .roo/rules/your-custom-name.md
    ```

### Onboarding a New Developer

When new developers clone the project, the symbolic links may not exist, or they may be using a different operating system (Windows, macOS, or Linux), where symbolic links are implemented differently. They need to run the `rule-link create` command once to generate these symbolic links locally.

```bash
# After git clone
git clone project-url
cd project

# Generate local rule file links
rule-link create
```

## Command Reference

### `rule-link create`

Creates symbolic links for AI tool rule files.

**Options:**

-   `-f, --file <path>`: Specify the path to the source rule file. (Default: `rule.md`)
-   `-l, --list <tools...>`: Provide a space-separated list of AI tools to link, skipping the interactive menu.
-   `-c, --custom <paths>`: Provide a comma-separated list of custom file paths to link.
-   `-v, --version`: Display the version number.
-   `-h, --help`: Display help information.

**Advanced Options:**

-   `-t, --target <name>`: Specify the target file name for AI tools. (Default: `coding-standards.md`)
    > **Note**: This only affects tools that support custom file names (Cursor, Augment, Windsurf, Cline, Roo Code). Tools like Claude Code and Gemini CLI use fixed file names and will ignore this parameter.

**Examples:**

```bash
# Interactive mode
$ rule-link create

# Specify a different source file
$ rule-link create --file my-awesome-rules.md

# Link specific tools directly
$ rule-link create --list Cursor Windsurf Claude Code

# Link custom files
$ rule-link create --custom ".vscode/rules.md,enterprise.md"

# Combine flags
$ rule-link create --file project-rules.md --list Cursor --custom "docs/guidelines.md"
```

## License

This project is licensed under the MIT License.