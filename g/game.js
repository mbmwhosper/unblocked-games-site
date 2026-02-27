const GAME_SOURCES = [
  {
    name: "lunaar",
    priority: 2,
    url: "https://raw.githubusercontent.com/thedogecraft/lunaar.org/main/public/json/games.json"
  },
  {
    name: "swarmintelli",
    priority: 1,
    url: "https://raw.githubusercontent.com/swarmintelli/Unblocked-Games-CDN/main/games.json"
  }
];

function getSlugFromUrl() {
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  if (pathParts[0] === "g" && pathParts[1]) return pathParts[1];
  const params = new URLSearchParams(window.location.search);
  return params.get("slug") || "";
}

function slugify(s = "") {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function extractSrc(iframeValue = "") {
  const match = iframeValue.match(/src\s*=\s*"([^"]+)"/i);
  return match ? match[1] : "";
}

function normalizeFromSwarm(item, idx, sourceName, priority) {
  const name = item.name || item.game_name || `Game ${idx + 1}`;
  const embedUrl = item.game_url || item.embed_url || extractSrc(item.iframe || "");
  return {
    slug: item.slug || item["game-id"] || slugify(name),
    name,
    category: item.category || "Games",
    description: item.game_description || item.description || "Play in your browser.",
    url: embedUrl,
    sourceName,
    priority
  };
}

function normalizeFromLunaar(item, idx, sourceName, priority) {
  const name = item.name || `Game ${idx + 1}`;
  return {
    slug: item.slug || slugify(name),
    name,
    category: item.category || "Games",
    description: item.description || "Play in your browser.",
    url: item.url || "",
    sourceName,
    priority
  };
}

function normalizeUnknown(item, idx, sourceName, priority) {
  const name = item.name || item.title || item.game_name || `Game ${idx + 1}`;
  return {
    slug: item.slug || item.id || item["game-id"] || slugify(name),
    name,
    category: item.category || "Games",
    description: item.description || "Play in your browser.",
    url: item.url || item.game_url || item.embed_url || extractSrc(item.iframe || ""),
    sourceName,
    priority
  };
}

function normalizeItem(item, idx, source) {
  if (source.name === "swarmintelli") return normalizeFromSwarm(item, idx, source.name, source.priority);
  if (source.name === "lunaar") return normalizeFromLunaar(item, idx, source.name, source.priority);
  return normalizeUnknown(item, idx, source.name, source.priority);
}

function isUsableUrl(url = "") {
  return /^https?:\/\//i.test(url);
}

function mergeSources(rows) {
  const map = new Map();

  for (const g of rows) {
    if (!g?.name || !g?.url || !isUsableUrl(g.url)) continue;

    const key = slugify(g.name);
    const existing = map.get(key);

    if (!existing) {
      map.set(key, g);
      continue;
    }

    if (g.priority > existing.priority || (g.priority === existing.priority && g.url.length > existing.url.length)) {
      map.set(key, g);
    }
  }

  return Array.from(map.values());
}

const slug = getSlugFromUrl();
const gameName = document.getElementById("gameName");
const gameDescription = document.getElementById("gameDescription");
const frame = document.getElementById("gameFrame");
const fullscreenBtn = document.getElementById("fullscreenBtn");

async function init() {
  let game = null;
  try {
    const settled = await Promise.allSettled(
      GAME_SOURCES.map(async source => {
        const res = await fetch(source.url, { cache: "no-store" });
        const data = await res.json();
        const arr = Array.isArray(data) ? data : (Array.isArray(data.games) ? data.games : []);
        return arr.map((item, idx) => normalizeItem(item, idx, source));
      })
    );

    const games = mergeSources(
      settled.filter(r => r.status === "fulfilled").flatMap(r => r.value)
    );

    game = games.find(g => g.slug === slug);
  } catch (e) {
    gameName.textContent = "Game catalog unavailable";
    gameDescription.textContent = "Could not load game list from GitHub sources.";
    return;
  }

  if (!game) {
    gameName.textContent = "Game not found";
    gameDescription.textContent = "The requested game slug does not exist in catalog.";
    return;
  }

  document.title = `PlayPortal — ${game.name}`;
  gameName.textContent = game.name;
  gameDescription.textContent = `${game.category} • ${game.description}`;
  frame.src = game.url;
  fullscreenBtn.disabled = false;
}

fullscreenBtn.addEventListener("click", async () => {
  if (!document.fullscreenElement) {
    await frame.requestFullscreen?.();
  } else {
    await document.exitFullscreen?.();
  }
});

init();
