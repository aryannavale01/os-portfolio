// Copies the files the standalone Next.js build needs at runtime.
// `next build` emits `.next/standalone` but leaves `public/` and `.next/static`
// for the deploy step — copy them in so `npm run start` works locally.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const standalone = path.join(ROOT, '.next', 'standalone');

if (!fs.existsSync(path.join(standalone, 'server.js'))) {
  throw new Error(
    'Missing .next/standalone/server.js — run `npm run build` before `npm run start`.'
  );
}

function copy(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, { recursive: true, force: true });
}

copy(path.join(ROOT, 'public'), path.join(standalone, 'public'));
copy(path.join(ROOT, '.next', 'static'), path.join(standalone, '.next', 'static'));

console.log('[start] copied public/ and .next/static into .next/standalone/');
