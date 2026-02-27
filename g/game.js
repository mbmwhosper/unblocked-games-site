const MONKEY_CONFIG_JS = "https://cdn.jsdelivr.net/gh/MonkeyGG2/monkeygg2.github.io@main/js/config.js";
const MONKEY_BASE = "https://monkeygg2.github.io/games/";

function getSlugFromUrl() {
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  if (pathParts[0] === "g" && pathParts[1]) return pathParts[1];
  const params = new URLSearchParams(window.location.search);
  return params.get("slug") || "";
}

function slugify(s = "") {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
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

function buildGamesFromMonkeyConfig() {
  const cfg = window.json?.games || {};
  const entries = Object.entries(cfg);

  return entries
    .map(([name, meta]) => {
      const path = meta?.path || "";
      const categories = Array.isArray(meta?.categories) && meta.categories.length ? meta.categories : ["Games"];
      const isFlash = path.startsWith("flash/");
      if (!path || isFlash) return null;

      return {
        slug: slugify(name),
        name,
        category: categories[0],
        description: `Source: MonkeyGG2 HTML5 (${path})`,
        url: `${MONKEY_BASE}${path}`
      };
    })
    .filter(Boolean);
}

const slug = getSlugFromUrl();
const gameName = document.getElementById("gameName");
const gameDescription = document.getElementById("gameDescription");
const frame = document.getElementById("gameFrame");
const fullscreenBtn = document.getElementById("fullscreenBtn");

async function init() {
  let game = null;
  try {
    await loadScript(MONKEY_CONFIG_JS);
    const games = buildGamesFromMonkeyConfig();
    game = games.find(g => g.slug === slug);
  } catch (e) {
    gameName.textContent = "Game catalog unavailable";
    gameDescription.textContent = "Could not load MonkeyGG2 game list.";
    return;
  }

  if (!game) {
    gameName.textContent = "Game not found";
    gameDescription.textContent = "Requested game slug was not found in MonkeyGG2 HTML5 catalog.";
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
