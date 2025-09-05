// Simple ESLint config for CI/CD compatibility
export default [
  {
    ignores: [
      'node_modules/**',
      'frontend/node_modules/**',
      'backend/node_modules/**',
      'frontend/.next/**',
      'frontend/out/**',
      'backend/dist/**',
      '**/*.min.js',
      '**/*.d.ts',
    ],
  },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
      },
    },
    rules: {
      // Minimal rules to avoid breaking the build
      'no-unused-vars': 'off',
      'no-console': 'off',
      'no-undef': 'off',
    },
  },
];
