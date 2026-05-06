import { readdir } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve('test-results');

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.png')) {
      files.push(fullPath);
    }
  }
  return files;
}

async function main() {
  let screenshots = [];
  try {
    screenshots = await walk(ROOT);
  } catch {
    console.log('No test-results directory found.');
    process.exit(0);
  }

  if (screenshots.length === 0) {
    console.log('No screenshots were generated.');
    process.exit(0);
  }

  console.log('Playwright screenshots:');
  for (const screenshotPath of screenshots) {
    console.log(`- ${screenshotPath}`);
  }
}

await main();
