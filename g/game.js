const LOCAL_GAMES_JSON = "/games.local.json";

function getSlugFromUrl() {
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  if (pathParts[0] === "g" && pathParts[1]) return pathParts[1];
  const params = new URLSearchParams(window.location.search);
  return params.get("slug") || "";
}

function slugify(s = "") {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function normalize(item, idx) {
  const name = item.name || `Game ${idx + 1}`;
  return {
    slug: item.slug || slugify(name),
    name,
    category: item.category || "Games",
    description: item.description || "Self-hosted HTML5 game.",
    url: item.url || ""
  };
}

const slug = getSlugFromUrl();
const gameName = document.getElementById("gameName");
const gameDescription = document.getElementById("gameDescription");
const frame = document.getElementById("gameFrame");
const fullscreenBtn = document.getElementById("fullscreenBtn");

async function init() {
  try {
    const res = await fetch(LOCAL_GAMES_JSON, { cache: "no-store" });
    const data = await res.json();
    const games = (Array.isArray(data) ? data : []).map(normalize).filter(g => /^\/assets\/allgames\//.test(g.url));
    const game = games.find(g => g.slug === slug);

    if (!game) {
      gameName.textContent = "Game not found";
      gameDescription.textContent = "Add this game to /games.local.json and ensure /assets/allgames/<slug>/index.html exists.";
      return;
    }

    document.title = `PlayPortal — ${game.name}`;
    gameName.textContent = game.name;
    gameDescription.textContent = `${game.category} • ${game.description}`;
    frame.src = game.url;
    fullscreenBtn.disabled = false;
  } catch {
    gameName.textContent = "Game catalog unavailable";
    gameDescription.textContent = "Could not load local catalog.";
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
