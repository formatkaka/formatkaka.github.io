import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";
import eslintPluginAstro from 'eslint-plugin-astro';

export default defineConfig([
  // Ignore build directories and auto-generated files
  {
    ignores: [
      "dist/**",
      ".astro/**",
      "node_modules/**",
      "**/*.config.mjs",
      "**/env.d.ts",
    ],
  },

  // Base configuration for all JS/TS files
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: globals.browser
    },
  },
  js.configs.recommended,

  // TypeScript configuration
  ...tseslint.configs.recommended,

  // React configuration - only for React files
  {
    files: ["**/*.{jsx,tsx}"],
    ...pluginReact.configs.flat.recommended,
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off", // Not needed in React 17+
    },
  },

  // Astro configuration
  ...eslintPluginAstro.configs.recommended,
]);
