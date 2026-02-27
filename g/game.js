const REMOTE_GAMES_JSON = "https://raw.githubusercontent.com/swarmintelli/Unblocked-Games-CDN/main/games.json";

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

function normalizeRemoteGame(item, idx) {
  const name = item.game_name || item.name || `Game ${idx + 1}`;
  const embedUrl = item.embed_url || extractSrc(item.iframe || "");
  return {
    slug: item.slug || slugify(name),
    name,
    category: item.category || "Games",
    description: item.game_description || item.description || "Play in your browser.",
    url: embedUrl
  };
}

const slug = getSlugFromUrl();
const gameName = document.getElementById("gameName");
const gameDescription = document.getElementById("gameDescription");
const frame = document.getElementById("gameFrame");
const fullscreenBtn = document.getElementById("fullscreenBtn");

async function init() {
  let game = null;
  try {
    const res = await fetch(REMOTE_GAMES_JSON, { cache: "no-store" });
    const data = await res.json();
    const arr = Array.isArray(data) ? data : (Array.isArray(data.games) ? data.games : []);
    const games = arr.map(normalizeRemoteGame).filter(g => g.url);
    game = games.find(g => g.slug === slug);
  } catch (e) {
    gameName.textContent = "Game catalog unavailable";
    gameDescription.textContent = "Could not load game list from GitHub.";
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
