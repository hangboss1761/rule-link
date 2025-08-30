# Requirements Document

## Introduction

rule-link is a command-line tool designed to help developers unify the management of rule files for multiple AI programming tools. By creating symbolic links to a unified `rule.md` file, developers can maintain rule consistency across different AI tools (such as Cursor, Windsurf, Claude, etc.) and avoid maintaining multiple duplicate rule files.

## Requirements

### Requirement 1

**User Story:** As a developer, I want to be able to quickly create rule files for mainstream AI tools and symbolically link them to a unified `rule.md` file, so that I can generate project-level rule files within 5 seconds and avoid maintaining multiple rule files.

#### Acceptance Criteria

1.  WHEN a developer runs the `rule-link create` command AND selects the desired AI tool types, THEN the system should generate the corresponding rule files within 5 seconds AND create symbolic links to the unified `rule.md` file.
2.  WHEN a developer modifies the content of the `rule.md` file, THEN all created AI tool rule files should be automatically updated AND maintain content consistency.
3.  WHEN a developer uses different AI tools in the project, THEN each tool should be able to read the same rule content AND there should be no need to manually maintain multiple rule files.
4.  WHEN the system creates rule files, THEN it must support mainstream AI tools such as Cursor (`.cursorrules`), Windsurf (`.windsurfrules`), Claude (`claude.md`), etc.
5.  WHEN the generation process begins, THEN the entire operation must be completed within 5 seconds.

### Requirement 2

**User Story:** As a developer, I want to be able to select the AI tool rule files to be generated through a command-line interactive interface, in order to have a good user experience and operational efficiency.

#### Acceptance Criteria

1.  WHEN a developer runs the tool command, THEN the system should display a list of optional AI tools AND provide a clear selection interface.
2.  WHEN a developer selects one or more AI tools, THEN the system should confirm the selection and start generating the corresponding rule files AND display the generation progress.
3.  WHEN the generation is complete, THEN the system should display a success message and the paths of the generated files AND provide suggestions for the next steps.
4.  WHEN a developer enters an invalid selection, THEN the system should display an error message AND redisplay the selection interface.
5.  WHEN the user interacts with the interface, THEN the system should support keyboard navigation and shortcut keys.
6.  WHEN an error occurs, THEN the system should provide user-friendly error messages.

### Requirement 3

**User Story:** As a developer, I want the tool to be able to run cross-platform and correctly handle file system operations, so that it can be used normally on different operating systems.

#### Acceptance Criteria

1.  WHEN the tool runs on Windows, macOS, or Linux systems, THEN the system should work normally AND provide a consistent user experience.
2.  WHEN the system creates symbolic links, THEN it must use symbolic links (symlink) to achieve file association.
3.  WHEN the target file already exists, THEN the system should ask the user whether to overwrite it AND provide safe operation options.
4.  WHEN there are insufficient permissions to create a symbolic link, THEN the system should provide a clear error message AND suggest a solution.

### Requirement 4

**User Story:** As a developer, I want to be able to specify custom rule file paths in order to support additional AI tools or specific project rule file configurations.

#### Acceptance Criteria

1.  WHEN a developer runs `rule-link create --custom ".custom/coding-standards.md,docs/project-rules.md"`, THEN the system should parse the comma-separated file paths AND create a symbolic link for each path.
2.  WHEN a developer enters custom file paths in interactive mode, THEN the system should support multiple paths separated by commas AND validate the legality of each path.
3.  WHEN a custom file path contains illegal characters, THEN the system should display an error message AND ask for re-entry.
4.  WHEN a custom file path requires the creation of a directory, THEN the system should automatically create the necessary directory structure.
5.  WHEN a custom file path uses a relative path, THEN the system should correctly resolve it to an absolute path.
6.  WHEN the creation of custom file symbolic links is successful, THEN the system should display a success message AND include the paths of all created files.

# Workflow

## First-time project use

1.  Run the `rule-link create` command.
2.  Use `git commit` to commit the generated files.
3.  Configure `.gitignore` to ignore the files (recommended, as the implementation of symbolic links is not consistent across different systems, to avoid overwriting each other).

## First-time personal use

When cloning a project with `git clone`, you should run the `rule-link create` command.