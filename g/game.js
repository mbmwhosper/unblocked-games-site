const JSON_SOURCES = [
  {
    name: "lunaar",
    url: "https://raw.githubusercontent.com/thedogecraft/lunaar.org/main/public/json/games.json",
    priority: 3
  },
  {
    name: "swarmintelli",
    url: "https://raw.githubusercontent.com/swarmintelli/Unblocked-Games-CDN/main/games.json",
    priority: 2
  },
  {
    name: "55gms",
    url: "https://raw.githubusercontent.com/55gms/55GMS/main/static/assets/json/load/g.json",
    priority: 1
  }
];

const MONKEY_CONFIG_JS = "https://cdn.jsdelivr.net/gh/MonkeyGG2/monkeygg2.github.io@main/js/config.js";
const MONKEY_BASE = "https://monkeygg2.github.io/games/";

function slugify(s = "") {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function extractSrc(iframeValue = "") {
  const m = iframeValue.match(/src\s*=\s*"([^"]+)"/i);
  return m ? m[1] : "";
}

function isUsableHtml5Url(url = "") {
  if (!/^https?:\/\//i.test(url)) return false;
  if (/\.swf($|\?)/i.test(url)) return false;
  if (/\bflash\b/i.test(url)) return false;
  return true;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

function getSlugFromUrl() {
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  if (pathParts[0] === "g" && pathParts[1]) return pathParts[1];
  const params = new URLSearchParams(window.location.search);
  return params.get("slug") || "";
}

function fromMonkeyConfig() {
  const cfg = window.json?.games || {};
  return Object.entries(cfg)
    .map(([name, meta]) => {
      const path = meta?.path || "";
      if (!path || path.startsWith("flash/")) return null;
      return {
        slug: slugify(name),
        name,
        category: (meta?.categories && meta.categories[0]) || "Games",
        description: "HTML5",
        url: `${MONKEY_BASE}${path}`,
        priority: 4
      };
    })
    .filter(Boolean);
}

function normalizeJsonItem(item, source, idx) {
  const name = item.name || item.game_name || item.title || `Game ${idx + 1}`;
  const url = item.url || item.game_url || item.embed_url || extractSrc(item.iframe || "");
  return {
    slug: item.slug || item["game-id"] || slugify(name),
    name,
    category: item.category || "Games",
    description: item.description || item.game_description || "HTML5",
    url,
    priority: source.priority
  };
}

function dedupeMerge(rows) {
  const byName = new Map();
  for (const g of rows) {
    if (!g?.name || !isUsableHtml5Url(g.url)) continue;
    const key = slugify(g.name);
    const cur = byName.get(key);
    if (!cur || g.priority > cur.priority || (g.priority === cur.priority && g.url.length > cur.url.length)) {
      byName.set(key, g);
    }
  }
  return Array.from(byName.values());
}

const slug = getSlugFromUrl();
const gameName = document.getElementById("gameName");
const gameDescription = document.getElementById("gameDescription");
const frame = document.getElementById("gameFrame");
const fullscreenBtn = document.getElementById("fullscreenBtn");

async function loadJsonSource(source) {
  const res = await fetch(source.url, { cache: "no-store" });
  const data = await res.json();
  const arr = Array.isArray(data) ? data : (Array.isArray(data.games) ? data.games : []);
  return arr.map((item, idx) => normalizeJsonItem(item, source, idx));
}

async function init() {
  try {
    await loadScript(MONKEY_CONFIG_JS);
    const monkeyGames = fromMonkeyConfig();

    const settled = await Promise.allSettled(JSON_SOURCES.map(loadJsonSource));
    const jsonGames = settled.filter(r => r.status === "fulfilled").flatMap(r => r.value);

    const games = dedupeMerge([...monkeyGames, ...jsonGames]);
    const game = games.find(g => g.slug === slug);

    if (!game) {
      gameName.textContent = "Game not found";
      gameDescription.textContent = "Requested game slug was not found in loaded HTML5 catalogs.";
      return;
    }

    document.title = `PlayPortal — ${game.name}`;
    gameName.textContent = game.name;
    gameDescription.textContent = `${game.category} • ${game.description}`;
    frame.src = game.url;
    fullscreenBtn.disabled = false;
  } catch (e) {
    gameName.textContent = "Game catalog unavailable";
    gameDescription.textContent = "Could not load game list from sources.";
  }
}

fullscreenBtn.addEventListener("click", async () => {
  if (!document.fullscreenElement) {
    await frame.requestFullscreen?.();
  } else {
    await document.exitFullscreen?.();
  }
});

init();
