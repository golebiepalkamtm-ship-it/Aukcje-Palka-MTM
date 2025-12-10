import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  {
    ignores: [
      '.next/**',
      'my-app/.next/**',
      'public/sw.js',
      'public/workbox-*.js',
      'node_modules/**',
      'dist/**',
      'build/**',
      '*.min.js',
      '*.bundle.js',
    ],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tsParser,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      // Add basic rules
      'no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', {
        'argsIgnorePattern': '^_',
        'varsIgnorePattern': '^_',
        'ignoreRestSiblings': true,
        'caughtErrorsIgnorePattern': '^_',
        'destructuredArrayIgnorePattern': '^_'
      }],
    },
  },
];
