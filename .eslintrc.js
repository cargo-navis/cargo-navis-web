module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'next/core-web-vitals',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  plugins: [
    '@typescript-eslint',
    'simple-import-sort',
    'react',
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    'no-unused-vars': 'warn',
    
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    
    'react/jsx-sort-props': [
      'error',
      {
        'callbacksLast': true,
        'shorthandFirst': true,
        'ignoreCase': true,
        'reservedFirst': true,
      }
    ],

    '@next/next/no-html-link-for-pages': 'error',
    '@next/next/no-img-element': 'error',
    'react/react-in-jsx-scope': 'off',
    'jsx-a11y/alt-text': 'warn',
    'react/prop-types': 'off',
  },
  settings: {
    react: {
      version: 'detect',
    },
  }
}; 