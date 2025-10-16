// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import mdx from '@astrojs/mdx';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  site: 'https://formatkaka.github.io',
  base: '',

  vite: {
    plugins: [tailwindcss()],
    envDir: './env',
  },

  integrations: [
    mdx(),
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
  ],
});
