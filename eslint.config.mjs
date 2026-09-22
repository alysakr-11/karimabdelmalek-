import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

/**
 * ESLint flat config.
 *
 * `next lint` was removed in Next 15, so the lint script drives the ESLint CLI
 * directly. `eslint-config-next` still ships as eslintrc-style config, hence
 * FlatCompat — this is the migration path Next documents, not a workaround.
 *
 * The ruleset is `next/core-web-vitals` plus `next/typescript`. No formatting
 * rules and no Prettier: the repository has a consistent house style already,
 * and a formatter introduced now would rewrite every file and bury real
 * changes under whitespace.
 */
const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const config = [
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'node_modules/**', 'next-env.d.ts', 'playwright-report/**', 'test-results/**', '**/*.local.mjs'],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    // The build scripts are standalone Node tools, not part of the bundle.
    files: ['scripts/**/*.mjs'],
    rules: {
      'no-console': 'off',
    },
  },
];

export default config;
