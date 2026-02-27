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

function fromMonkeyConfig() {
  const cfg = window.json?.games || {};
  return Object.entries(cfg)
    .map(([name, meta]) => {
      const path = meta?.path || "";
      if (!path || path.startsWith("flash/")) return null;

      const categories = Array.isArray(meta?.categories) && meta.categories.length
        ? meta.categories
        : ["Games"];

      return {
        slug: slugify(name),
        name,
        category: categories[0],
        description: `HTML5 • ${path}`,
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
  try {
    await loadScript(MONKEY_CONFIG_JS);
    const games = fromMonkeyConfig();
    const game = games.find(g => g.slug === slug);

    if (!game) {
      gameName.textContent = "Game not found";
      gameDescription.textContent = "Requested game slug was not found in the HTML5 catalog.";
      return;
    }

    document.title = `PlayPortal — ${game.name}`;
    gameName.textContent = game.name;
    gameDescription.textContent = `${game.category} • ${game.description}`;
    frame.src = game.url;
    fullscreenBtn.disabled = false;
  } catch {
    gameName.textContent = "Game catalog unavailable";
    gameDescription.textContent = "Could not load HTML5 catalog.";
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
