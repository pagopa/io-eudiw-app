import nx from '@nx/eslint-plugin';
import sonarjs from 'eslint-plugin-sonarjs';
import reactNative from 'eslint-plugin-react-native';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],

  {
    ignores: ['**/dist', '**/out-tsc', '**/node_modules/**', '**/.expo/**'],
  },

  // 1. GLOBAL RULES (No Type Information Required)
  // These apply to .js, .mjs, .ts, etc.
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.mjs'],
    plugins: {
      sonarjs,
      'react-native': reactNative,
    },
    rules: {
      'prefer-const': 'error',
      'no-console': 'error',
      'no-var': 'error',
      eqeqeq: ['error', 'smart'],
      // Add other non-typed rules here...
    },
  },

  // 2. TYPESCRIPT RULES (Requires Type Information)
  // Only apply these to TS files
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/restrict-plus-operands': 'error',
      '@typescript-eslint/dot-notation': 'error',
      // Add other @typescript-eslint rules that need types here...
    },
  },

  // 3. EXPORT/CONFIG FILES OVERRIDE
  // Disable typed rules for JS config files specifically if they still get caught
  {
    files: ['**/*.js', '**/*.mjs', '**/.*.js'],
    rules: {
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
    },
  },

  eslintPluginPrettierRecommended,
];
