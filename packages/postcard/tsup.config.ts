import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.tsx'],
  format: ['cjs', 'esm'],
  dts: true,
  external: ['solid-js', 'solid-js/web'],
  clean: true,
  // Preserve JSX so consuming apps can transform it
  // (Vite/Astro with @astrojs/solid-js handles this automatically)
  esbuildOptions(options) {
    options.jsx = 'preserve';
    options.jsxImportSource = 'solid-js';
  },
  outExtension({ format }) {
    return { js: format === 'esm' ? '.mjs' : '.js' };
  },
});
