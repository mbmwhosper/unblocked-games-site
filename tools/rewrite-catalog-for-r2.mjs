import fs from 'node:fs';
import path from 'node:path';

// Usage:
// node tools/rewrite-catalog-for-r2.mjs https://games.skeezers.org

const base = process.argv[2];
if (!base || !/^https?:\/\//.test(base)) {
  console.error('Provide base URL, e.g. https://games.skeezers.org');
  process.exit(1);
}

const root = process.cwd();
const file = path.join(root, 'games.local.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

const cleanBase = base.replace(/\/$/, '');
const updated = data.map(g => {
  const next = { ...g };
  if (typeof next.url === 'string' && next.url.startsWith('/assets/allgames/')) {
    next.url = `${cleanBase}${next.url}`;
  }
  if (typeof next.thumbnail === 'string' && next.thumbnail.startsWith('/assets/allgames/')) {
    next.thumbnail = `${cleanBase}${next.thumbnail}`;
  }
  return next;
});

fs.writeFileSync(file, JSON.stringify(updated, null, 2) + '\n');
console.log(`Updated catalog URLs to ${cleanBase}`);
