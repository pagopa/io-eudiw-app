// https://docs.expo.dev/guides/using-eslint/
const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const stylistic = require('@stylistic/eslint-plugin');
const sonarjs = require('eslint-plugin-sonarjs');
const reactNative = require('eslint-plugin-react-native');

module.exports = defineConfig([
  {
    ignores: ['.expo/*', 'eslint.config.js']
  },
  expoConfig,
  {
    ignores: ['dist/*', 'expo-env.d.ts', 'tsconfig.json'],
    plugins: {
      '@stylistic': stylistic,
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
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'object-curly-spacing': 'off',
      '@stylistic/object-curly-spacing': ['error', 'always'],
      'comma-dangle': ['error', 'never'],
      'no-case-declarations': 'off',
      'no-inner-declarations': 'off',
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
      quotes: 'off',
      eqeqeq: ['error', 'smart'],
      'max-classes-per-file': ['error', 1],
      'guard-for-in': 'error',
      complexity: 'error',
      'arrow-body-style': 'error',
      'import/order': 'error',
      '@typescript-eslint/no-unused-vars': 'off',
      // Enable if we want to enforce the return type for all the functions
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/array-type': [
        'error',
        {
          default: 'generic'
        }
      ],
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/consistent-type-assertions': 'error',
      '@typescript-eslint/dot-notation': 'error',
      '@stylistic/member-delimiter-style': [
        'error',
        {
          multiline: {
            delimiter: 'semi',
            requireLast: true
          },
          singleline: {
            delimiter: 'semi',
            requireLast: false
          }
        }
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      'no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-expressions': ['error'],
      '@typescript-eslint/prefer-function-type': 'error',
      '@typescript-eslint/restrict-plus-operands': 'error',
      semi: 'off',
      '@stylistic/semi': ['error'],
      '@typescript-eslint/unified-signatures': 'error',
      'react/prop-types': 'off',
      'react/display-name': 'off',
      'react/jsx-key': 'error',
      'react/jsx-no-bind': ['error', { allowArrowFunctions: true }],
      'react/no-unstable-nested-components': [
        'off',
        {
          allowAsProps: true
        }
      ],
      'react/no-direct-mutation-state': 'off',
      'react/require-render-return': 'off',
      'sonarjs/no-small-switch': 'off',
      'sonarjs/no-duplicate-string': 'off',
      'sonarjs/no-nested-template-literals': 'warn',
      'react-native/no-unused-styles': 'error',
      'react-native/split-platform-components': 'off',
      'react-native/no-inline-styles': 'off',
      'react-native/no-color-literals': 'error',
      'react-native/no-single-element-style-arrays': 'warn',
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
  }
]);
