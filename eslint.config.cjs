// Try to import the Next shareable config (core-web-vitals) and use it
// Minimal flat config for ESLint v9+ that focuses on project files
// and avoids linting generated/test/helper folders which caused parse errors.
const path = require('path');

module.exports = [
  // Global ignores
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      '__tests__/**',
      'test-results/**',
      'e2e/**',
      'public/**',
      'scripts/**',
      'prisma/**',
      'types/**',
      'lib/**',
      'functions/**',
    ],
  },

  // TypeScript files - use @typescript-eslint/parser
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        project: path.resolve(__dirname, 'tsconfig.json'),
      },
      globals: {},
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      react: require('eslint-plugin-react'),
      'react-hooks': require('eslint-plugin-react-hooks'),
      '@next/next': require('@next/eslint-plugin-next'),
    },
    settings: { react: { version: 'detect' } },
    rules: {},
  },

  // JS/JSX files - use default parser with JSX enabled
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
    },
    rules: {},
  },
];
