import path from 'node:path';

import { fileURLToPath } from 'node:url';

import { defineConfig, globalIgnores } from 'eslint/config';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';

import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores(['**/node_modules', '**/dist']),
  {
    extends: compat.extends(
      '@jenssimon/base',
      'plugin:@typescript-eslint/recommended',
      'plugin:prettier/recommended',
    ),

    plugins: {
      '@typescript-eslint': typescriptEslint,
      prettier,
    },

    languageOptions: {
      globals: {
        ...globals.node,
      },

      parser: tsParser,
      ecmaVersion: 12,
      sourceType: 'module',
    },

    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js', '.ts'],
        },
      },
    },

    rules: {
      'sonarjs/x-powered-by': 'off',
      'prettier/prettier': ['error'],
      '@typescript-eslint/no-unused-vars': ['error', {}],
      'no-console': 'off',
      'import/extensions': 'off',
      'unicorn/prevent-abbreviations': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'unicorn/no-null': 'off',
      'import-esm/explicit-extension': 'off',
      'import/order': 'off'
    },
  },
  {
    ignores: ['eslint.config.mjs'],
  },
]);
