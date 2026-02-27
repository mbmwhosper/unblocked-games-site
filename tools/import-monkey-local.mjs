import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const workspace = '/home/c/.openclaw/workspace';
const sourceRoot = path.join(workspace, 'monkeygg2.github.io');
const sourceConfig = path.join(sourceRoot, 'js', 'config.js');
const sourceGames = path.join(sourceRoot, 'games');

const targetRoot = path.join(workspace, 'unblocked-games-site');
const targetGames = path.join(targetRoot, 'assets', 'allgames');
const targetCatalog = path.join(targetRoot, 'games.local.json');

function slugify(s = '') {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function loadMonkeyConfig() {
  const code = fs.readFileSync(sourceConfig, 'utf8');
  const sandbox = {};
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { timeout: 5000 });
  if (!sandbox.json?.games) throw new Error('Could not parse monkey config.js');
  return sandbox.json.games;
}

function findLaunchFile(dirPath) {
  const index = path.join(dirPath, 'index.html');
  if (fs.existsSync(index)) return 'index.html';

  const files = fs.readdirSync(dirPath, { withFileTypes: true })
    .filter(d => d.isFile() && d.name.toLowerCase().endsWith('.html'))
    .map(d => d.name)
    .sort();

  if (files.length) return files[0];
  return null;
}

function copyDir(src, dst) {
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.cpSync(src, dst, { recursive: true, force: true });
}

const gamesObj = loadMonkeyConfig();
const entries = Object.entries(gamesObj);

const catalog = [];
let copied = 0;
let skippedFlash = 0;
let skippedMissing = 0;
let skippedNoLaunch = 0;

for (const [name, meta] of entries) {
  const relPath = String(meta?.path || '').trim();
  if (!relPath) continue;
  if (relPath.startsWith('flash/')) {
    skippedFlash++;
    continue;
  }

  const relNoQuery = relPath.split('?')[0];
  const srcPath = path.join(sourceGames, relNoQuery);
  if (!fs.existsSync(srcPath)) {
    skippedMissing++;
    continue;
  }

  const safeSlug = slugify(name);
  const dstPath = path.join(targetGames, safeSlug);

  if (fs.statSync(srcPath).isDirectory()) {
    copyDir(srcPath, dstPath);
    const launch = findLaunchFile(dstPath);
    if (!launch) {
      skippedNoLaunch++;
      continue;
    }

    catalog.push({
      slug: safeSlug,
      name,
      category: (Array.isArray(meta?.categories) && meta.categories[0]) ? meta.categories[0] : 'Games',
      description: 'Imported HTML5 game',
      thumbnail: '',
      url: `/assets/allgames/${safeSlug}/${launch}`,
      featured: catalog.length < 16
    });
    copied++;
  } else if (fs.statSync(srcPath).isFile()) {
    fs.mkdirSync(dstPath, { recursive: true });
    const base = path.basename(srcPath);
    fs.copyFileSync(srcPath, path.join(dstPath, base));

    catalog.push({
      slug: safeSlug,
      name,
      category: (Array.isArray(meta?.categories) && meta.categories[0]) ? meta.categories[0] : 'Games',
      description: 'Imported HTML5 game',
      thumbnail: '',
      url: `/assets/allgames/${safeSlug}/${base}`,
      featured: catalog.length < 16
    });
    copied++;
  }
}

catalog.sort((a, b) => a.name.localeCompare(b.name));
fs.writeFileSync(targetCatalog, JSON.stringify(catalog, null, 2) + '\n');

console.log(JSON.stringify({
  imported: copied,
  catalogCount: catalog.length,
  skippedFlash,
  skippedMissing,
  skippedNoLaunch
}, null, 2));
