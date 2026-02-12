const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const sonarjs = require('eslint-plugin-sonarjs');
const reactNative = require('eslint-plugin-react-native');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  {
    ignores: [
      '.expo/*',
      '.vscode/*',
      'dist/*',
      'node_modules/*',
      'expo-env.d.ts',
      'tsconfig.json',
      'eslint.config.js'
    ]
  },
  ...expoConfig,
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      sonarjs,
      'react-native': reactNative
    },
    languageOptions: {
      parserOptions: {
        project: 'tsconfig.json',
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      // General
      'prefer-const': 'error',
      curly: 'error',
      'spaced-comment': ['error', 'always', { block: { balanced: true } }],
      radix: 'error',
      'one-var': ['error', 'never'],
      'object-shorthand': 'error',
      'no-var': 'error',
      'no-param-reassign': 'error',
      'no-underscore-dangle': 'error',
      'no-undef-init': 'error',
      'no-throw-literal': 'error',
      'no-new-wrappers': 'error',
      'no-eval': 'error',
      'no-console': 'error',
      'no-caller': 'error',
      'no-bitwise': 'error',
      'no-void': 'off',
      'no-duplicate-imports': 'error',
      eqeqeq: ['error', 'smart'],
      'max-classes-per-file': ['error', 1],
      'guard-for-in': 'error',
      complexity: 'error',
      'import/order': [
        'error',
        {
          alphabetize: {
            order: 'asc',
            caseInsensitive: true
          }
        }
      ],
      // Typescript
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/array-type': ['error', { default: 'generic' }],
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/consistent-type-assertions': 'error',
      '@typescript-eslint/dot-notation': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-unused-expressions': ['error'],
      '@typescript-eslint/prefer-function-type': 'error',
      '@typescript-eslint/restrict-plus-operands': 'error',
      '@typescript-eslint/unified-signatures': 'error',

      // React
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'react/jsx-key': 'error',
      'react/jsx-no-bind': ['error', { allowArrowFunctions: true }],
      'react-native/no-unused-styles': 'error',
      'react-native/no-color-literals': 'error',
      'react-native/no-single-element-style-arrays': 'warn',

      // SonarJS
      'sonarjs/no-small-switch': 'off',
      'sonarjs/no-duplicate-string': 'off',
      'sonarjs/no-nested-template-literals': 'warn',

      // Restricted Imports
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-redux',
              importNames: ['useDispatch'],
              message: 'Please use useAppDispatch instead.'
            },
            {
              name: 'react-redux',
              importNames: ['useSelector'],
              message: 'Please use useAppSelector instead.'
            }
          ]
        }
      ]
    }
  },

  // Prettier must be last
  eslintPluginPrettierRecommended
]);
