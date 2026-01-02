#!/usr/bin/env node
/**
 * Test script to verify the lint-configs package works correctly
 */

import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { pathToFileURL } from 'url';

async function testPackage() {
  console.log('🧪 Testing @rizzle/lint-configs package...\n');

  const tests = [
    {
      name: 'Package structure',
      test: async () => {
        const pkg = JSON.parse(await readFile('package.json', 'utf-8'));

        // Check exports
        if (!pkg.exports) throw new Error('Missing exports field');
        if (!pkg.exports['.']) throw new Error('Missing main export');
        if (!pkg.exports['./eslint']) throw new Error('Missing eslint export');
        if (!pkg.exports['./prettier']) throw new Error('Missing prettier export');

        console.log('  ✓ Package exports are correct');
      },
    },
    {
      name: 'Build outputs',
      test: async () => {
        // Check CJS
        await readFile('dist/cjs/index.js', 'utf-8');
        await readFile('dist/cjs/eslint.config.js', 'utf-8');
        await readFile('dist/cjs/prettier.config.js', 'utf-8');
        console.log('  ✓ CJS outputs exist');

        // Check ESM
        await readFile('dist/esm/index.mjs', 'utf-8');
        await readFile('dist/esm/eslint.config.mjs', 'utf-8');
        await readFile('dist/esm/prettier.config.mjs', 'utf-8');
        console.log('  ✓ ESM outputs exist');

        // Check types
        await readFile('dist/types/index.d.ts', 'utf-8');
        await readFile('dist/types/eslint.config.d.ts', 'utf-8');
        await readFile('dist/types/prettier.config.d.ts', 'utf-8');
        console.log('  ✓ Type declarations exist');
      },
    },
    {
      name: 'Import validation',
      test: async () => {
        // Dynamic import to test ESM exports
        try {
          const modulePath = resolve(process.cwd(), 'dist/esm/index.mjs');
          const moduleUrl = pathToFileURL(modulePath).href;

          const { eslintConfig, prettierConfig } = await import(moduleUrl);

          if (!eslintConfig || !Array.isArray(eslintConfig)) {
            throw new Error('eslintConfig is not a valid array');
          }
          console.log('  ✓ ESLint config imports correctly');

          if (!prettierConfig || typeof prettierConfig !== 'object') {
            throw new Error('prettierConfig is not a valid object');
          }
          console.log('  ✓ Prettier config imports correctly');

          // Check config contents
          if (!prettierConfig.printWidth) {
            throw new Error('Prettier config missing printWidth');
          }
          console.log('  ✓ Config contents are valid');
        } catch (err) {
          throw new Error(`Import failed: ${err.message}`);
        }
      },
    },
  ];

  let passed = 0;
  let failed = 0;

  for (const { name, test } of tests) {
    try {
      console.log(`📝 ${name}`);
      await test();
      passed++;
      console.log('');
    } catch (err) {
      console.error(`  ✗ ${err.message}\n`);
      failed++;
    }
  }

  console.log('─'.repeat(50));
  console.log(`Results: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed!');
  }
}

testPackage().catch((err) => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
