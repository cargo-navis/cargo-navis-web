// ESLint 9 flat config. Same rules as the old .eslintrc.js (Next 16 dropped `next lint`; `npm run lint` runs ESLint
// directly on src, like `next lint` did).
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
  {
    ignores: ['node_modules/', 'dist/', 'build/', '.next/', '.vercel/', '.context/', 'next-env.d.ts'],
  },
  {
    // ESLint 8 didn't report these by default.
    linterOptions: { reportUnusedDisableDirectives: 'off' },
  },
  ...tsPlugin.configs['flat/recommended'],
  prettierRecommended,
  {
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
      'unused-imports': unusedImports,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/camelcase': 'off',
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'react/no-unescaped-entities': 'off',
      'react/jsx-boolean-value': 'error',
      'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never', propElementValues: 'always' }],
      'react/jsx-sort-props': [
        'error',
        {
          callbacksLast: true,
        },
      ],
      'react/self-closing-comp': 'error',
      'unused-imports/no-unused-imports': 'error',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-vars': [
        'error',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      // Icons go through Icon from @/ui (sizes, stroke, a11y); only the Icon component itself imports Tabler.
      'no-restricted-imports': [
        'error',
        {
          paths: [{ name: '@tabler/icons-react', message: 'Use Icon from @/ui instead of importing Tabler icons.' }],
        },
      ],
    },
  },
  {
    files: ['src/ui/components/Icon/**'],
    rules: { 'no-restricted-imports': 'off' },
  },
];
