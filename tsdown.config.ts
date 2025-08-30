import { defineConfig } from 'tsdown'

export default defineConfig([
  {
    entry: ['./src/cli.ts'],
    platform: 'node',
    dts: false,
    name: 'cli',
    outDir: 'dist',
  },
  {
    entry: ['./src/index.ts'],
    platform: 'node',
    dts: true,
    name: 'index',
    outDir: 'dist',
  },
])
