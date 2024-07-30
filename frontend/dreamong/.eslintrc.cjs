module.exports = {
  root: true,
  env: { browser: true, es6: true, node: true },
  extends: [
    'airbnb',
    'plugin:prettier/recommended',
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  settings: { react: { version: '18.2' } },
  plugins: ['react', 'prettier', 'react-refresh'],
  rules: {
    'react/react-in-jsx-scope': 0,
    'react/prefer-stateless-function': 0,
    'react/jsx-filename-extension': 0,
    'react/jsx-one-expression-per-line': 0,
    'no-nested-ternary': 0,
    'react/jsx-no-target-blank': 'off',
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  },
};
