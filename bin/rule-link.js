#!/usr/bin/env node

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import the CLI module
const { cli } = await import(join(__dirname, '../dist/cli.js'));

// Run the CLI
cli();