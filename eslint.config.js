import eslintPluginAstro from 'eslint-plugin-astro';
export default [
  ...eslintPluginAstro.configs.recommended,
  {
    rules: {
      'no-unused-vars': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    // CLI scripts legitimately use console.log for output
    files: ['scripts/**'],
    rules: { 'no-console': 'off' },
  },
  {
    ignores: ['dist/', 'node_modules/', '.astro/', 'Client Docs/', 'docs/'],
  },
];
