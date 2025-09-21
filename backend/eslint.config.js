export default [
  {
    files: ["**/*.js"],
    ignores: [
      "node_modules/**",
      "coverage/**",
      "logs/**",
      "dist/**",
      "build/**"
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module"
    },
    linterOptions: {
      reportUnusedDisableDirectives: true
    },
    rules: {
      // keep rules minimal and non-blocking for now
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-console": "off"
    }
  }
];

