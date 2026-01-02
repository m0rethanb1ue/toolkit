#!/usr/bin/env node
import { readdir, rename, mkdir } from 'fs/promises';
import { join } from 'path';

async function organizeDTS() {
  try {
    const distDir = 'dist';
    const typesDir = join(distDir, 'types');

    // Ensure types directory exists
    await mkdir(typesDir, { recursive: true });

    // Read all files in dist
    const files = await readdir(distDir);

    // Move all .d.ts and .d.cts files to types directory
    for (const file of files) {
      if (file.endsWith('.d.ts') || file.endsWith('.d.cts')) {
        const baseName = file.replace(/\.d\.(c)?ts$/, '.d.ts');
        try {
          await rename(join(distDir, file), join(typesDir, baseName));
          console.log(`Moved ${file} -> types/${baseName}`);
        } catch (err) {
          // File might already be moved
          if (err.code !== 'ENOENT') {
            throw err;
          }
        }
      }
    }

    console.log('✓ Type declarations organized successfully');
  } catch (err) {
    console.error('Failed to organize type declarations:', err);
    process.exit(1);
  }
}

organizeDTS();
