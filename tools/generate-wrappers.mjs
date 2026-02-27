import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd();
const dataPath = path.join(root, 'games-data.js');
const outDir = path.join(root, 'assets', 'mainstorage');

const source = fs.readFileSync(dataPath, 'utf8');
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(source, sandbox);

const games = sandbox.window.GAMES || [];
if (!Array.isArray(games) || !games.length) {
  throw new Error('No games found in games-data.js');
}

fs.mkdirSync(outDir, { recursive: true });

const wrapper = (g) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${g.name} - PlayPortal</title>
  <style>
    html, body { margin: 0; height: 100%; background: #0a0f22; color: #ecf0ff; font-family: Inter, Arial, sans-serif; }
    .embed { position: fixed; inset: 0; border: 0; width: 100%; height: 100%; background: #0a0f22; }
    .overlay {
      position: fixed; inset: 0; display: grid; place-items: center;
      background: linear-gradient(180deg, #111932, #0a0f22);
      z-index: 10;
    }
    .card { text-align: center; padding: 20px; max-width: 680px; }
    h1 { margin: 0 0 8px; font-size: 28px; }
    p { margin: 0 0 16px; color: #97a3d1; }
    .actions { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
    a, button {
      border: 1px solid #2d3f7b; background: #172249; color: #ecf0ff;
      border-radius: 10px; padding: 10px 14px; cursor: pointer; text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="overlay" id="overlay">
    <div class="card">
      <h1>${g.name}</h1>
      <p>${g.description}</p>
      <div class="actions">
        <button id="playBtn">Play in Page</button>
        <a href="${g.url}" target="_blank" rel="noopener noreferrer">Launch Direct</a>
      </div>
    </div>
  </div>

  <iframe id="gameFrame" class="embed" title="${g.name}" allow="autoplay; fullscreen; gamepad; clipboard-read; clipboard-write"></iframe>

  <script>
    const playBtn = document.getElementById('playBtn');
    const frame = document.getElementById('gameFrame');
    const overlay = document.getElementById('overlay');
    const targetUrl = ${JSON.stringify(g.url)};

    playBtn.addEventListener('click', () => {
      frame.src = targetUrl;
      overlay.style.display = 'none';
    });
  </script>
</body>
</html>
`;

for (const g of games) {
  const file = path.join(outDir, `${g.slug}.html`);
  fs.writeFileSync(file, wrapper(g));
}

console.log(`Generated ${games.length} wrappers in ${outDir}`);
