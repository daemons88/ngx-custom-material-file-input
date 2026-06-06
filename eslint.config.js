// @ts-check
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

module.exports = [
  ...angular.configs.tsRecommended.map((config) => ({
    ...config,
    files: ["**/*.ts"],
  })),
  {
    files: ["**/*.ts"],
    processor: angular.processInlineTemplates,
    rules: {},
  },
  ...angular.configs.templateRecommended.map((config) => ({
    ...config,
    files: ["**/*.html"],
  })),
  {
    files: ["**/*.html"],
    rules: {},
  },
];
