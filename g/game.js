const CATALOG_URL = "/games.local.json";

const slugFromPath = () => {
  const p = location.pathname.split("/").filter(Boolean);
  if (p[0] === "g" && p[1]) return p[1];
  return new URLSearchParams(location.search).get("slug") || "";
};

const slugify = s => (s || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const normalize = (item, i) => ({
  slug: item.slug || slugify(item.name || `game-${i+1}`),
  name: item.name || `Game ${i+1}`,
  category: item.category || "Games",
  description: item.description || "Play in your browser",
  url: item.url || ""
});

const titleEl = document.getElementById("title");
const metaEl = document.getElementById("meta");
const frame = document.getElementById("frame");
const fullBtn = document.getElementById("full");

async function init() {
  try {
    const res = await fetch(CATALOG_URL, { cache: "no-store" });
    const data = await res.json();
    const list = (Array.isArray(data) ? data : []).map(normalize).filter(g => g.url.startsWith("/") || /^https?:\/\//.test(g.url));
    const game = list.find(g => g.slug === slugFromPath());
    if (!game) {
      titleEl.textContent = "Game not found";
      metaEl.textContent = "Check slug and games.local.json entry.";
      return;
    }

    document.title = `${game.name} • Skeezers Games`;
    titleEl.textContent = game.name;
    metaEl.textContent = `${game.category} • ${game.description}`;
    frame.src = game.url;
    fullBtn.disabled = false;
  } catch {
    titleEl.textContent = "Catalog unavailable";
    metaEl.textContent = "Could not load /games.local.json";
  }
}

fullBtn.onclick = async () => {
  if (!document.fullscreenElement) await frame.requestFullscreen?.();
  else await document.exitFullscreen?.();
};

init();