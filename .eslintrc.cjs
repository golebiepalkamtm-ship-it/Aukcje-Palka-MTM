/**
 * Classic ESLint config exported as CJS to avoid circular JSON serialization
 * issues when Next.js inspects the config during CI builds.
 */
module.exports = {
  extends: [],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react-hooks', '@next/next'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'prefer-const': 'warn',
    'no-console': 'off',
    'react/no-unescaped-entities': 'off',
  },
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
};

