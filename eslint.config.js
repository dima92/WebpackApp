const js = require('@eslint/js');
const { FlatCompat } = require('@eslint/eslintrc');
const path = require('path');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended
});

module.exports = [
  js.configs.recommended,
  ...compat.extends('eslint-config-airbnb-base'),
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname
      },
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        process: 'readonly'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      'no-console': 'off',
      'import/extensions': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      "linebreak-style": 0
    }
  },
  {
    ignores: ['dist/', 'node_modules/', 'webpack.config.js']
  }
];
