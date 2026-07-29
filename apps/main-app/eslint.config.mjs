import pagopa from '@pagopa/eslint-config/jest';
import globals from 'globals';

export default [
  ...pagopa,
  {
    ignores: [
      '**/out-tsc',
      '**/node_modules/**',
      '**/.expo/**',
      '**/*.js',
      '**/*.jsx',
      '**/babel.config.*',
      '**/jest.config.js',
      '**/metro.config.js'
    ]
  },
  {
    rules: {
      // Converting `type = {}` to `interface {}` breaks assignability to
      // `Record<string, unknown>` — TypeScript requires an explicit index
      // signature on interfaces, whereas type aliases satisfy it structurally.
      // This affects analytics helpers, navigation param lists, and any other
      // type used as a generic record argument throughout the codebase.
      '@typescript-eslint/consistent-type-definitions': 'off',

      // Allow `_`-prefixed throwaways and rest-sibling destructuring omits
      // (`const { key, ...rest } = obj`), matching tsc's own noUnusedLocals.
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_'
        }
      ]
    }
  },
  {
    // Static image assets must be loaded via `require()` for the React Native
    rules: {
      '@typescript-eslint/no-require-imports': [
        'error',
        { allow: ['\\.(png|jpg|jpeg|gif|webp)$'] }
      ]
    }
  },
  {
    // For test-related files, allow require() and jest.requireActual()
    files: [
      '**/test-setup.ts',
      '**/*.test.ts',
      '**/*.test.tsx',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/__mocks__/**'
    ],
    rules: {
      '@typescript-eslint/no-require-imports': 'off'
    }
  },
  {
    // For Node.js scripts, set Node globals and allow require()
    files: ['apps/**/scripts/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  },
  {
    // temporarily disable require imports for reactotron.ts since it depends on package bug
    files: ['src/config/reactotron.ts'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off'
    }
  }
];
