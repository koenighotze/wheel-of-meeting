import js from '@eslint/js';
import globals from 'globals';

export default [
  { ignores: ['node_modules'] },

  js.configs.recommended,

  // Browser app — plain script, no ESM
  {
    files: ['src/app.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: globals.browser,
    },
  },

  // Playwright tests and config — ESM, Node.js runtime.
  // Browser globals (window, document) are also needed because
  // page.evaluate() callbacks execute in the browser context.
  {
    files: ['tests/**/*.js', 'playwright.config.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node, ...globals.browser },
    },
  },
];
