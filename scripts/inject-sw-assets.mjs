import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const assets = readdirSync('dist/assets', { recursive: true })
  .filter(name => /\.(js|css|woff2?|png|svg)$/.test(name))
  .map(name => `/assets/${name.replaceAll('\\','/')}`);
const swPath = join('dist', 'sw.js');
let source = readFileSync(swPath, 'utf8');
source = source.replace('const SHELL = [', `const SHELL = [...${JSON.stringify(assets)}, `);
writeFileSync(swPath, source);
