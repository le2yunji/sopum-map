// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const storybookFiles = [
  "**/*.stories.@(ts|tsx|js|jsx|mjs|cjs)",
  "**/*.story.@(ts|tsx|js|jsx|mjs|cjs)",
  ".storybook/main.@(js|cjs|mjs|ts)",
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  ...storybook.configs["flat/recommended"].map((config) => ({
    ...config,
    files: config.files ?? storybookFiles,
  })),
]);

export default eslintConfig;
