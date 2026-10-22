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
  ignorePatterns: ['dist', 'dev-dist', 'archive', '.eslintrc.cjs'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  settings: {
    react: { version: '18.3' },
    'import/resolver': { './scripts/eslint-resolver.cjs': {} },
  },
  plugins: ['react', 'prettier', 'react-refresh'],
  overrides: [
    { files: ['src/**/index.js'], rules: { 'import/prefer-default-export': 'off' } },
    { files: ['vite.config.js', 'tailwind.config.js', 'postcss.config.js', 'scripts/**'], rules: { 'import/no-extraneous-dependencies': ['error', { devDependencies: true }] } },
    { files: ['public/firebase-messaging-sw.js'], env: { serviceworker: true }, globals: { firebase: 'readonly' } },
  ],
  rules: {
    'react/function-component-definition': ['error', { namedComponents: ['function-declaration', 'arrow-function'] }],
    'react/react-in-jsx-scope': 0,
    'react/prefer-stateless-function': 0,
    'react/jsx-filename-extension': 0,
    'react/jsx-one-expression-per-line': 0,
    'no-nested-ternary': 0,
    'react/jsx-no-target-blank': 'off',
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
  },
};
