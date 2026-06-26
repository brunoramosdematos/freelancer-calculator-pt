const globals = {
  afterEach: "readonly",
  beforeEach: "readonly",
  cy: "readonly",
  Cypress: "readonly",
  describe: "readonly",
  expect: "readonly",
  it: "readonly",
  vi: "readonly",
};

module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
    ecmaVersion: "latest",
    sourceType: "module",
    extraFileExtensions: [".vue"],
  },
  plugins: ["@typescript-eslint", "vue"],
  extends: [
    "eslint:recommended",
    "plugin:vue/vue3-recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier",
  ],
  ignorePatterns: [
    "coverage/",
    "dist/",
    "node_modules/",
    "*.log",
    "*.tgz",
    ".cache/",
    ".parcel-cache/",
    ".temp/",
  ],
  rules: {
    "vue/attributes-order": "off",
    "vue/multi-word-component-names": "off",
    "vue/require-default-prop": "off",
    "vue/require-explicit-emits": "off",
  },
  overrides: [
    {
      files: [
        "*.config.ts",
        "cypress.config.ts",
        "vite.config.ts",
        "vitest.config.ts",
      ],
      env: {
        browser: false,
        node: true,
      },
    },
    {
      files: ["cypress/**/*.ts", "src/**/*.spec.ts"],
      globals,
    },
    {
      files: ["scripts/**/*.mjs", "*.cjs"],
      parserOptions: {
        parser: null,
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
  ],
};
