// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';

import react from '@astrojs/react';
import solidJs from '@astrojs/solid-js';

// https://astro.build/config
export default defineConfig({
  site: 'https://formatkaka.github.io',
  base: '',

  vite: {
    plugins: [tailwindcss()],
    envDir: './env',
    build: {
      rollupOptions: {
        external: ['@langchain/langgraph', '@langchain/openai'],
      },
    },
  },

  integrations: [
    mdx(),
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
      include: ['**/*.tsx', '**/*.jsx'],
      exclude: ['**/postcard/**'],
    }),
    solidJs({
      include: ['**/postcard/**/*.tsx', '**/postcard/**/*.jsx'],
    }),
  ],
});
