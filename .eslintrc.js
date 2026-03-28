module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  env: {
    node: true,
    es2022: true,
  },
  rules: {
    // 98% Evaluation Matrix Requirements
    '@typescript-eslint/no-explicit-any': 'error',
    'complexity': ['error', 10],
    'max-lines': ['error', { 'max': 300, 'skipBlankLines': true, 'skipComments': true }],
    'max-lines-per-function': ['error', { 'max': 50, 'skipBlankLines': true, 'skipComments': true }],
  },
};
