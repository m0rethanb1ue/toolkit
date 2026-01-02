import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/eslint.config.ts',
    'src/prettier.config.ts',
    'src/react-native.config.ts',
  ],
  format: ['cjs', 'esm'],
  dts: {
    only: false,
    resolve: true,
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  shims: true,
  outExtension({ format }) {
    if (format === 'cjs') {
      return { js: '.js' };
    }
    return { js: '.mjs' };
  },
  esbuildOptions(options, context) {
    if (context.format === 'cjs') {
      options.outdir = 'dist/cjs';
    } else if (context.format === 'esm') {
      options.outdir = 'dist/esm';
    }
  },
});
